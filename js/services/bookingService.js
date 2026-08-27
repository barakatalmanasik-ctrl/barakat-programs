// BookingService - creates real Supabase bookings for the in-app flow.
// - When logged in, links the booking to the current user (RLS owner policies).
// - When not logged in, creates a guest booking (user_id null, customer_* filled).
// - Lets the database generate the order_number (BK-YYYY-NNNNN) via trigger.

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
        currency: bookingData.currency || 'SAR',
        customer_notes: bookingData.notes || '',
        customer_name: bookingData.customerName,
        customer_phone: bookingData.customerPhone,
        customer_email: bookingData.customerEmail || null,
        customer_city: bookingData.customerCity || null,
        rooms_count: bookingData.roomsCount || 1,
        room_type: bookingData.roomType || null
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(row)
        .select()
        .single();

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
      return {
        success: false,
        error: e.message || 'حدث خطأ أثناء إرسال طلب الحجز'
      };
    }
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
