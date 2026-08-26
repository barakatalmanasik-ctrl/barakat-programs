const BookingService = {
  async createBooking(bookingData) {
    try {
      const orderNumber = 'ORD-' + Date.now().toString().slice(-6);

      const { data: booking, error: bookingError } = await SupabaseClient
        .from('bookings')
        .insert({
          order_number: orderNumber,
          user_id: null,
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
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      if (bookingData.travelers && bookingData.travelers.length > 0) {
        const travelers = bookingData.travelers.map((t, i) => ({
          booking_id: booking.id,
          full_name: t.name,
          phone: t.phone || null,
          nationality: t.nationality || null,
          date_of_birth: t.dateOfBirth || null,
          passport_number: t.passportNumber || null,
          sort_order: i
        }));

        const { error: travelersError } = await SupabaseClient
          .from('booking_travelers')
          .insert(travelers);

        if (travelersError) throw travelersError;
      }

      return {
        success: true,
        orderNumber: orderNumber,
        bookingId: booking.id
      };
    } catch (e) {
      console.error('Booking creation error:', e);
      return {
        success: false,
        error: e.message || 'حدث خطأ أثناء إرسال طلب الحجز'
      };
    }
  }
};
