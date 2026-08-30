// BookingService - creates real Supabase bookings for the in-app flow.
// - When logged in, links the booking to the current user (RLS owner policies).
// - When not logged in, creates a guest booking (user_id null, customer_* filled).
// - Lets the database generate the order_number (BK-YYYY-NNNNN) via trigger,
//   but falls back to a collision-resistant client-generated number on races.

const BookingService = {
  async createBooking(bookingData) {
    try {
      const supabase = SupabaseClient;
      const user = AuthService.currentUser;
      const uid = user && user.id ? user.id : null;

      // Guard against mock/numeric program ids reaching the DB (they violate the
      // UUID foreign key on bookings.program_id). Only real Supabase rows qualify.
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!bookingData.programId || !UUID_REGEX.test(String(bookingData.programId))) {
        return {
          success: false,
          error: 'عذراً، هذا البرنامج غير متاح للحجز عبر الموقع حالياً. يرجى الاتصال على أرقام خدمة الزبائن.'
        };
      }

      const row = {
        user_id: uid,
        program_id: bookingData.programId,
        status: 'pending',
        travelers_count: bookingData.travelersCount,
        total_price: bookingData.totalPrice,
        currency: bookingData.currency || 'د.ع',
        customer_notes: bookingData.notes || '',
        customer_name: bookingData.customerName,
        customer_phone: bookingData.customerPhone,
        customer_email: bookingData.customerEmail || null,
        customer_city: bookingData.customerCity || null,
        rooms_count: bookingData.roomsCount || 1,
        room_type: bookingData.roomType || null
      };

      // ── Insert booking (with retry on order-number collisions).
      // The DB trigger historically generated numbers non-atomically (MAX+1),
      // so two concurrent inserts could collide on the same order number.
      // On a collision we retry and supply a client-generated unique number so
      // customers aren't blocked until the DB-side sequence migration is applied.
      let booking, bookingError;
      let clientOrderNumber = null;
      const MAX_BOOKING_ATTEMPTS = 3;
      for (let attempt = 1; attempt <= MAX_BOOKING_ATTEMPTS; attempt++) {
        const attemptRow = clientOrderNumber
          ? Object.assign({}, row, { order_number: clientOrderNumber })
          : row;
        const res = await supabase
          .from('bookings')
          .insert(attemptRow)
          .select()
          .single();
        booking = res.data;
        bookingError = res.error;

        const collided = bookingError &&
          (bookingError.code === '23505' ||
           /bookings_order_number_key/i.test(String(bookingError.message || '')));
        if (!collided) break;

        if (attempt < MAX_BOOKING_ATTEMPTS) {
          if (!clientOrderNumber) clientOrderNumber = BookingService._generateOrderNumber();
          await new Promise(resolve => setTimeout(resolve, 400 * attempt + Math.round(Math.random() * 200)));
        }
      }

      if (bookingError) throw bookingError;

      // Insert all travelers (travelers[0] is the main traveler).
      if (bookingData.travelers && bookingData.travelers.length > 0) {
        const travelers = bookingData.travelers.map((t, i) => ({
          booking_id: booking.id,
          full_name: t.name,
          phone: t.phone || null,
          nationality: t.nationality || null,
          date_of_birth: t.dateOfBirth || null,
          passport_number: t.passportNumber || null,
          notes: t.notes || '',
          sort_order: i
        }));

        const { error: travelersError } = await supabase
          .from('booking_travelers')
          .insert(travelers);

        if (travelersError) throw travelersError;
      }

      return {
        success: true,
        orderNumber: booking.order_number,
        bookingId: booking.id
      };
    } catch (e) {
      console.error('Booking creation error:', e);
      const msg = String((e && e.message) || '');
      if (e && e.code === '23505') {
        return { success: false, error: 'حدث تعارض مؤقت في إرسال الطلب. يرجى المحاولة مرة أخرى سريعاً.' };
      }
      return {
        success: false,
        error: (msg && !['[object Object]', '{}'].includes(msg)) ? msg : 'حدث خطأ أثناء إرسال طلب الحجز'
      };
    }
  },

  // Collision-resistant fallback order number, used only when the DB-side
  // generator collides so inserts never block on the unique constraint.
  // Format: BK-YYYY-<7-digit-ms><3-random> (unique across devices/submits).
  _generateOrderNumber() {
    const tail = String(Date.now()).slice(-7) +
      String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return 'BK-' + new Date().getFullYear() + '-' + tail;
  },

  // Fetch bookings belonging to the current user (desc by created_at).
  async getUserBookings() {
    const user = AuthService.currentUser;
    if (!user || !user.id) return [];
    try {
      const supabase = SupabaseClient;
      const { data, error } = await supabase
        .from('bookings')
        .select('*, programs(id, name, emoji, destination_id)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Get user bookings error:', e);
      return [];
    }
  },

  // Fetch a single booking (by id) - RLS restricts to owner or staff.
  async getBookingById(bookingId) {
    try {
      const supabase = SupabaseClient;
      const { data, error } = await supabase
        .from('bookings')
        .select('*, booking_travelers(*)')
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Get booking detail error:', e);
      return null;
    }
  },

  async cancelBooking(bookingId) {
    try {
      const supabase = SupabaseClient;
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', AuthService.currentUser?.id)
        .in('status', ['pending', 'reviewing']);

      if (error) throw error;
      return { success: true };
    } catch (e) {
      console.error('Cancel booking error:', e);
      return { success: false, error: e.message };
    }
  }
};
