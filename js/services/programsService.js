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

  // Canonical display destinations for the fixed seed IDs. Kept in the
  // frontend because the `destinations` table is not readable by the anon
  // role (RLS) in the live DB, so a Supabase join would resolve to nothing
  // and every program used to fall back to "إيران".
  _destFallbackMap: {
    '11111111-1111-1111-1111-111111111111': { name: 'إيران', emoji: '🇮🇷', gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2C5F8A 100%)' },
    '22222222-2222-2222-2222-222222222222': { name: 'السعودية', emoji: '🇸🇦', gradient: 'linear-gradient(135deg, #0F4C5C 0%, #1B7A8C 100%)' },
    '33333333-3333-3333-3333-333333333333': { name: 'تركيا', emoji: '🇹🇷', gradient: 'linear-gradient(135deg, #C0392B 0%, #E67E22 100%)' }
  },

  // Static gallery fallback for the fixed hotel names (3 photos each). Used
  // when the live `hotels` table doesn't expose the images column yet.
  _hotelImageMap: {
    'فندق انتخاب': ['images/hotels/entekhab-1.jpg', 'images/hotels/entekhab-2.jpg', 'images/hotels/entekhab-3.jpg'],
    'فندق بارسيان': ['images/hotels/parsian-1.jpg', 'images/hotels/parsian-2.jpg', 'images/hotels/parsian-3.jpg'],
    'فندق خاور': ['images/hotels/khawar-1.jpg', 'images/hotels/khawar-2.jpg', 'images/hotels/khawar-3.jpg']
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
      gallery: p.gallery || [],
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

    // Read programs WITHOUT the embedded destinations join. The join can fail /
    // return zero via RLS on the related table and silently drop us into the
    // Mock fallback (showing fake programs that can't be booked). Reading the
    // tables separately keeps every real program alive even if a related table
    // denies access. Destinations are merged afterwards.
    const { data: programs, error: progError } = await supabase
      .from('programs')
      .select('*');

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

    // Load destinations separately (tolerant: fall back to mock dest list if fail).
    let destMap = {};
    try {
      const { data: dests } = await SupabaseClient.from('destinations').select('id, name, emoji, gradient');
      (dests || []).forEach(d => { destMap[d.id] = d; });
    } catch (e) {
      console.error('[ProgramsService] destinations load error (continuing):', e);
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
      const dest = this._destFallbackMap[p.destination_id] || destMap[p.destination_id] || {};
      const norm = {
        id: p.id,
        destinationId: p.destination_id,
        name: p.name,
        destination: dest.name || 'إيران',
        destinationEmoji: dest.emoji || '🇮🇷',
        type: p.type,
        status: p.status,
        statusText: this._statusTextMap[p.status] || 'متاح',
        coverImage: p.cover_image,
        gallery: p.gallery || [],
        emoji: p.emoji,
        gradient: p.gradient || dest.gradient || undefined,
        dateDeparture: p.date_departure,
        dateReturn: p.date_return,
        dateDisplay: p.date_display || (p.date_departure ? this._fmtDate(p.date_departure) : 'قريباً'),
        dateReturnDisplay: p.date_return_display || (p.date_return ? this._fmtDate(p.date_return) : 'قريباً'),
        days: p.days,
        nights: p.nights,
        price: Number(p.price) || 0,
        currency: p.currency || 'د.ع',
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
        if (mock.gallery && mock.gallery.length) norm.gallery = mock.gallery.slice();
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
          images: (h.images && h.images.length) ? h.images : (this._hotelImageMap[h.name] || []),
          roomType: ph.room_type || 'غرفة قياسية',
          nights: ph.nights || 0,
          amenities: ph.amenities || h.amenities || [],
        };
      });
  },

  async _loadDestinations() {
    // Build the destination list from the programs that actually exist, so the
    // names/emojis always match what the cards show (never stale mock labels).
    const byId = {};
    const counts = {};
    (this._programs || []).forEach(p => {
      if (!p.destinationId) return;
      byId[p.destinationId] = {
        id: p.destinationId,
        name: p.destination,
        emoji: p.destinationEmoji || '✈️',
        gradient: p.gradient || undefined
      };
      counts[p.destinationId] = (counts[p.destinationId] || 0) + 1;
    });
    const list = Object.keys(byId).map(id => ({
      ...byId[id],
      programCount: counts[id] || 0
    }));
    if (list.length) return list;
    try {
      const { data } = await SupabaseClient.from('destinations').select('id, name, emoji, gradient');
      if (data && data.length) {
        return data.map(d => ({
          id: d.id,
          name: d.name,
          emoji: d.emoji,
          gradient: d.gradient,
          programCount: counts[d.name] || 0
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
