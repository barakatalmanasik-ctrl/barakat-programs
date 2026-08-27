// ProgramsService - loads programs from Supabase `programs` table.
// Normalizes Supabase rows (with destinations, program_days, hotels)
// into the flat object shape the frontend pages expect. Falls back to
// MockData.programs when Supabase is unavailable or returns no data.

const ProgramsService = {
  _programs: null,
  _destinations: null,
  _loaded: false,

  _statusTextMap: {
    available: 'متاح للحجز',
    published: 'متاح للحجز',
    limited: 'المقاعد محدودة',
    full: 'مكتمل',
    soon: 'قريباً',
    draft: 'مسودة',
    expired: 'منتهي',
    ended: 'منتهي'
  },

  isConfigured() {
    return typeof SupabaseClient !== 'undefined' && SupabaseClient.isConfigured;
  },

  async init() {
    if (this.isConfigured()) {
      try {
        await this._loadFromSupabase();
        return;
      } catch (e) {
        console.error('ProgramsService Supabase load error:', e);
      }
    }
    this._programs = this._normalizeMock(MockData.programs);
    this._destinations = MockData.destinations;
    this._loaded = true;
  },

  _normalizeMock(list) {
    return (list || []).map(p => ({
      id: String(p.id),
      name: p.name,
      destination: p.destination,
      destinationEmoji: p.destinationEmoji,
      type: p.type,
      status: p.status,
      statusText: p.statusText || this._statusTextMap[p.status] || 'متاح',
      coverImage: p.coverImage,
      emoji: p.emoji,
      gradient: p.gradient,
      dateDeparture: p.dateDeparture,
      dateReturn: p.dateReturn,
      dateDisplay: p.dateDisplay,
      dateReturnDisplay: p.dateReturnDisplay,
      days: p.days,
      nights: p.nights,
      price: Number(p.price) || 0,
      currency: p.currency,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      includedServices: p.includedServices || [],
      excludedServices: p.excludedServices || [],
      bookingTerms: p.bookingTerms,
      cancellationPolicy: p.cancellationPolicy,
      highlights: p.highlights || [],
      itinerary: p.itinerary || [],
      hotels: p.hotels || [],
      enriched: false
    }));
  },

  async _loadFromSupabase() {
    const supabase = SupabaseClient;

    const { data: programs, error: progError } = await supabase
      .from('programs')
      .select('*, destinations(id, name, emoji, gradient)');

    if (progError) {
      console.error('[ProgramsService] programs query error:', progError.message);
      throw progError;
    }
    console.log('[ProgramsService] programs from Supabase:', programs ? programs.length : 0);
    if (!programs || programs.length === 0) {
      console.warn('[ProgramsService] EMPTY programs -> LAUNCHING MOCK FALLBACK (this is why booking ids are numeric/non-UUID)');
      this._programs = this._normalizeMock(MockData.programs);
      this._destinations = MockData.destinations;
      this._loaded = true;
      return;
    }

    // Load program_days + hotels for itinerary/hotels enrichment
    let daysByProgram = {};
    let hotelsByProgram = {};
    try {
      const programIds = programs.map(p => p.id);
      const [{ data: days }, { data: progHotels }] = await Promise.all([
        supabase.from('program_days').select('*').in('program_id', programIds),
        supabase.from('program_hotels')
          .select('*, hotels(id, name, city, stars, rating, image_url, amenities)')
          .in('program_id', programIds)
      ]);
      (days || []).forEach(d => {
        (daysByProgram[d.program_id] = daysByProgram[d.program_id] || []).push(d);
      });
      (progHotels || []).forEach(ph => {
        (hotelsByProgram[ph.program_id] = hotelsByProgram[ph.program_id] || []).push(ph);
      });
    } catch (e) {
      console.error('ProgramsService days/hotels load error:', e);
    }

    // Lookup table of mock programs by name for enrichment fallback
    const mockByName = {};
    (MockData.programs || []).forEach(m => { mockByName[m.name] = m; });

    this._programs = programs.map(p => {
      const dest = p.destinations || {};
      const norm = {
        id: p.id,
        name: p.name,
        destination: dest.name || 'إيران',
        destinationEmoji: dest.emoji || '🇮🇷',
        type: p.type,
        status: p.status,
        statusText: this._statusTextMap[p.status] || 'متاح',
        coverImage: p.cover_image,
        emoji: p.emoji,
        gradient: p.gradient || dest.gradient,
        dateDeparture: p.date_departure,
        dateReturn: p.date_return,
        dateDisplay: p.date_display || (p.date_departure ? this._fmtDate(p.date_departure) : 'قريباً'),
        dateReturnDisplay: p.date_return_display || (p.date_return ? this._fmtDate(p.date_return) : 'قريباً'),
        days: p.days,
        nights: p.nights,
        price: Number(p.price) || 0,
        currency: p.currency || 'ج.د',
        shortDescription: p.short_description,
        fullDescription: p.full_description,
        includedServices: p.included_services || [],
        excludedServices: p.excluded_services || [],
        bookingTerms: p.booking_terms,
        cancellationPolicy: p.cancellation_policy,
        highlights: p.highlights || [],
        itinerary: this._buildItinerary(daysByProgram[p.id] || []),
        hotels: this._buildHotels(hotelsByProgram[p.id] || []),
        enriched: false
      };

      // Enrich from matching mock program when Supabase lacks rich content
      const mock = mockByName[p.name];
      if (mock) {
        if (!norm.itinerary.length) norm.itinerary = (mock.itinerary || []).map(d => Object.assign({}, d));
        if (!norm.hotels.length) norm.hotels = (mock.hotels || []).map(h => Object.assign({}, h));
        if (!norm.coverImage) norm.coverImage = mock.coverImage || null;
        if (!norm.emoji) norm.emoji = mock.emoji;
        if (!norm.gradient) norm.gradient = mock.gradient;
        if (!norm.dateDisplay || norm.dateDisplay === 'قريباً') norm.dateDisplay = mock.dateDisplay || norm.dateDisplay;
        if (!norm.dateReturnDisplay || norm.dateReturnDisplay === 'قريباً') norm.dateReturnDisplay = mock.dateReturnDisplay || norm.dateReturnDisplay;
        if (!norm.destinationEmoji) norm.destinationEmoji = mock.destinationEmoji;
        norm.enriched = true;
      }

      return norm;
    });

    this._destinations = await this._loadDestinations();
    this._loaded = true;
  },

  _buildItinerary(days) {
    if (!days || !days.length) return [];
    return days
      .slice()
      .sort((a, b) => a.day_number - b.day_number)
      .map(d => ({
        day: d.day_number,
        title: d.title,
        city: d.city || '',
        notes: d.notes || '',
        meals: {
          breakfast: !!d.meals_breakfast,
          lunch: !!d.meals_lunch,
          dinner: !!d.meals_dinner
        },
        visits: d.visits || [],
        activities: d.activities || [],
        hotel: null
      }));
  },

  _buildHotels(progHotels) {
    if (!progHotels || !progHotels.length) return [];
    return progHotels
      .slice()
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(ph => {
        const h = ph.hotels || {};
        return {
          name: h.name || 'فندق',
          city: h.city || '',
          stars: h.stars || 3,
          rating: h.rating,
          image: h.image_url,
          roomType: ph.room_type || 'غرفة قياسية',
          nights: ph.nights || 0,
          amenities: ph.amenities || h.amenities || [],
        };
      });
  },

  async _loadDestinations() {
    try {
      const { data } = await SupabaseClient.from('destinations').select('id, name, emoji, gradient');
      if (data && data.length) {
        const counts = {};
        (this._programs || []).forEach(p => {
          const key = p.destination;
          counts[key] = (counts[key] || 0) + 1;
        });
        return data.map(d => ({
          id: d.id,
          name: d.name,
          emoji: d.emoji,
          gradient: d.gradient,
          programCount: counts[d.name] || (MockData.destinations.find(m => m.name === d.name) || {}).programCount || 0
        }));
      }
    } catch (e) {}
    return MockData.destinations;
  },

  _fmtDate(d) {
    try {
      return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return String(d); }
  },

  // Public API
  getAll() {
    if (!this._loaded) this._programs = this._normalizeMock(MockData.programs);
    return [...this._programs];
  },

  getVisible() {
    if (!this._loaded) this._programs = this._normalizeMock(MockData.programs);
    return this._programs.filter(p => p && p.status !== 'draft' && p.status !== 'expired' && p.status !== 'soon');
  },

  getById(id) {
    if (!this._loaded) this._programs = this._normalizeMock(MockData.programs);
    const key = String(id);
    return this._programs.find(p => String(p.id) === key) || null;
  },

  getDestinations() {
    if (!this._destinations) this._destinations = MockData.destinations;
    return [...this._destinations];
  }
};
