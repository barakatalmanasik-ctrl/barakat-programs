const ProgramStatus = {
  AVAILABLE: 'available',
  LIMITED: 'limited',
  FULL: 'full',
  SOON: 'soon',
  ENDED: 'ended'
};

const ProgramStatusLabel = {
  available: 'متاح للحجز',
  limited: 'المقاعد محدودة',
  full: 'مكتمل',
  soon: 'قريباً',
  ended: 'منتهي'
};

const MockData = {
  destinations: [
    { id: 1, name: "إيران", emoji: "🇮🇷", gradient: "linear-gradient(135deg, #1B3A5C 0%, #2C5F8A 100%)", programCount: 8 },
    { id: 2, name: "تركيا", emoji: "🇹🇷", gradient: "linear-gradient(135deg, #C4454D 0%, #E06B6B 100%)", programCount: 12 },
    { id: 3, name: "لبنان", emoji: "🇱🇧", gradient: "linear-gradient(135deg, #3A7D6B 0%, #5BA08D 100%)", programCount: 5 },
    { id: 4, name: "العراق", emoji: "🇮🇶", gradient: "linear-gradient(135deg, #C8963E 0%, #D4AB5E 100%)", programCount: 10 },
    { id: 5, name: "السعودية", emoji: "🇸🇦", gradient: "linear-gradient(135deg, #4A90B8 0%, #6BA8CE 100%)", programCount: 7 },
    { id: 6, name: "مصر", emoji: "🇪🇬", gradient: "linear-gradient(135deg, #8B6914 0%, #B8941E 100%)", programCount: 4 },
    { id: 7, name: "دبي", emoji: "🇦🇪", gradient: "linear-gradient(135deg, #2C5F8A 0%, #4A90B8 100%)", programCount: 6 },
    { id: 8, name: "ماليزيا", emoji: "🇲🇾", gradient: "linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)", programCount: 3 }
  ],

  tripTypes: [
    { id: "all", label: "الكل" },
    { id: "adventure", label: "رحلات برية" },
    { id: "flight", label: "رحلات جوية" },
    { id: "tourism", label: "برامج سياحية" },
    { id: "religious", label: "برامج دينية" },
    { id: "family", label: "برامج عائلية" },
    { id: "special", label: "برامج خاصة" }
  ],

  priceRanges: [
    { id: "all", label: "الكل", min: 0, max: Infinity },
    { id: "budget", label: "أقل من 2000", min: 0, max: 2000 },
    { id: "mid", label: "2000 - 3500", min: 2000, max: 3500 },
    { id: "high", label: "3500 - 5000", min: 3500, max: 5000 },
    { id: "premium", label: "أكثر من 5000", min: 5000, max: Infinity }
  ],

  durationRanges: [
    { id: "all", label: "الكل", min: 0, max: Infinity },
    { id: "short", label: "1-3 أيام", min: 1, max: 3 },
    { id: "medium", label: "4-6 أيام", min: 4, max: 6 },
    { id: "long", label: "7-10 أيام", min: 7, max: 10 },
    { id: "extended", label: "أكثر من 10", min: 10, max: Infinity }
  ],

  programs: [
    {
      id: 1,
      name: "رحلة مشاهير طهران وقشم",
      destination: "إيران",
      destinationEmoji: "🇮🇷",
      type: "tourism",
      coverImage: null,
      dateDeparture: "2026-09-15",
      dateReturn: "2026-09-20",
      dateDisplay: "15 سبتمبر 2026",
      dateReturnDisplay: "20 سبتمبر 2026",
      nights: 5,
      days: 6,
      price: 3200,
      currency: "ر.س",
      status: ProgramStatus.AVAILABLE,
      statusText: ProgramStatusLabel.available,
      emoji: "🏔️",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      shortDescription: "رحلة سياحية مميزة تشمل زيارة معالم طهران واستجمام جزيرة قشم",
      fullDescription: "رحلة سياحية شاملة تأخذك في جولة مميزة بين أجمل المعالم في طهران وجزيرة قشم. ستتمتع بزيارة برج ميلاد الشهير وقصر غلستان التاريخي، ثم ننتقل إلى جزيرة قشم للاستمتاع بجمالها الطبيعي الخلاب والكهوف العجيبة والتسوق في المنطقة الحرة.",
      includedServices: ["ال[float] طيران الدولي والداخلي", "الفندق 5 نجوم", "الوجبات اليومية", "التنقلات الداخلية", "المرشد السياحي", "التأشيرات"],
      excludedServices: ["التأمين الصحي", "النفقات الشخصية", "الإكراميات", "المشروبات غير المشمولة"],
      bookingTerms: "يجب دفع دفعة مقدمة 30% عند الحجز. يُطلب سداد المبلغ كاملاً قبل 14 يوم من تاريخ السفر. يجب تقديم جواز سفر ساري المفعول لمدة لا تقل عن 6 أشهر.",
      cancellationPolicy: "إلغاء مجاني قبل 14 يوم من تاريخ الرحلة. خصم 25% عند الإلغاء خلال 7-14 يوم. لا يوجد استرداد خلال أقل من 7 أيام.",
      highlights: ["زيارة برج ميلاد", "جولة في جزيرة قشم", "التسوق في المنطقة الحرة", "الكهوف الطبيعية"],
      itinerary: [
        {
          day: 1,
          title: "الوصول إلى طهران",
          city: "طهران",
          meals: { breakfast: false, lunch: false, dinner: true },
          visits: ["الوصول إلى مطار طهران الدولي", "الانتقال إلى الفندق"],
          activities: ["استراحة في الفندق"],
          hotel: { name: "فندق إسبيرانس طهران", stars: 5, city: "طهرan", rating: 4.5, roomType: "غرفة مزدوجة فاخرة", nights: 3 },
          notes: "الوصول في المساء. استلام الغرف في تمام الساعة 3 عصراً."
        },
        {
          day: 2,
          title: "جولة طهران الثقافية",
          city: "طهران",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["برج ميلاد", "قصر غلستان", "متحف جيهان نما"],
          activities: ["التسوق في سوق تجري", "جولة في وسط المدينة"],
          hotel: null,
          notes: "يرجى ارتداء ملابس مريحة للجولات المشي."
        },
        {
          day: 3,
          title: "الانتقال إلى قشم",
          city: "قشم",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["الانتقال إلى المطار", "الوصول إلى قشم"],
          activities: ["طيران داخلي إلى قشم", "استكشاف المنطقة الحرة"],
          hotel: { name: "منتجع فندق قشم إنترناشونال", stars: 5, city: "قشم", rating: 4.3, roomType: "جناح بانورامي", nights: 2 },
          notes: "ال_check_in في الفندق عند الوصول."
        },
        {
          day: 4,
          title: "استكشاف جزيرة قشم",
          city: "قشم",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["الكهوف الملونة", "تشTree الطبيعية", "متحف الد occupants"],
          activities: ["سباحة وغوص", "جولة بالقارب"],
          hotel: null,
          notes: "يوم مشمس. لا تنسِ واقي الشمس."
        },
        {
          day: 5,
          title: "العودة إلى طهران",
          city: "طهران",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["المطار", "وسط طهران"],
          activities: ["طيران عائد إلى طهران", "وقت حر للتسوق في سوق lớn"],
          hotel: { name: "فندق إسبيرانس طهران", stars: 5, city: "طهران", rating: 4.5, roomType: "غرفة مزدوجة فاخرة", nights: 1 },
          notes: "آخر يوم في إيران. فرصة للتسوق."
        },
        {
          day: 6,
          title: "المغادرة",
          city: "طهران",
          meals: { breakfast: true, lunch: false, dinner: false },
          visits: ["المطار"],
          activities: ["المغادرة إلى المملكة العربية السعودية"],
          hotel: null,
          notes: "يُنصح بالوصول للمطار قبل 3 ساعات."
        }
      ],
      hotels: [
        { name: "فندق إسبيرانس طهران", stars: 5, city: "طهران", rating: 4.5, image: null, nights: 4, roomType: "غرفة مزدوجة فاخرة", amenities: ["واي فاي مجاني", "مسبح", "صالة رياضية", "مطعم", "سبا"] },
        { name: "منتجع فندق قشم إنترناشونال", stars: 5, city: "قشم", rating: 4.3, image: null, nights: 2, roomType: "جناح بانورامي", amenities: ["واي فاي مجاني", "شاطئ خاص", "مطعم", "مرافق ترفيهية"] }
      ]
    },
    {
      id: 2,
      name: "عشق اسطنبول السياحي",
      destination: "تركيا",
      destinationEmoji: "🇹🇷",
      type: "tourism",
      coverImage: null,
      dateDeparture: "2026-10-01",
      dateReturn: "2026-10-05",
      dateDisplay: "1 أكتوبر 2026",
      dateReturnDisplay: "5 أكتوبر 2026",
      nights: 4,
      days: 5,
      price: 2800,
      currency: "ر.س",
      status: ProgramStatus.AVAILABLE,
      statusText: ProgramStatusLabel.available,
      emoji: "🕌",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      shortDescription: "استكشف جمال اسطنبول بين القديم والحديث",
      fullDescription: "رحلة سياحية مميزة إلى مدينة اسطنبول التي تجمع بين الماضي العريق والحاضر المشرق. ستزور أجمل المساجد التاريخية مثل المسجد الأزرق وآيا صوفيا، وستستمتع بجولة بحرية في مضيق البوسفور، فضلاً عن التسوق في الأسواق العريقة والاستمتاع بالمطابخ التركية الرائعة.",
      includedServices: ["ال[float] طيران الدولي", "الفندق 4 نجوم", "الفطور اليومي", "جولة البوسفور", "التنقلات", "المرشد السياحي"],
      excludedServices: ["ال Insurance الصحي", "الوجبات غير المشمولة", "النفقات الشخصية", "التأشيرات"],
      bookingTerms: "يجب دفع دفعة مقدمة 25% عند الحجز. السداد الكامل قبل 10 أيام من السفر.",
      cancellationPolicy: "إلغاء مجاني قبل 10 أيام. خصم 30% خلال 5-10 أيام. لا استرداد خلال أقل من 5 أيام.",
      highlights: ["المسجد الأزرق", "قصر توبكابي", "البازار الكبير", "رحلة بحرية في البوسفور"],
      itinerary: [
        {
          day: 1,
          title: "الوصول إلى اسطنبول",
          city: "اسطنبول",
          meals: { breakfast: false, lunch: false, dinner: true },
          visits: ["الوصول إلى مطار اسطنبول", "Transfer to hotel"],
          activities: ["الانتقال إلى الفندق"],
          hotel: { name: "فندق ماريوت اسطنبول", stars: 5, city: "اسطنبول", rating: 4.6, roomType: "غرفة سوبيرير", nights: 4 },
          notes: "الوصول في المساء. عشاء ترحيبي في مطعم الفندق."
        },
        {
          day: 2,
          title: "جولة القسم الأوروبي القديم",
          city: "اسطنبول",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["المسجد الأزرق", "آيا صوفيا", "قصر توبكابي", "السبيل"],
          activities: ["جولة مشي في المنطقة التاريخية", "البازار الكبير"],
          hotel: null,
          notes: "يرجى ارتداء ملابس محتشمة لزيارة المساجد."
        },
        {
          day: 3,
          title: "رحلة البوسفور",
          city: "اسطنبول",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["مضيق البوسفور", "قصر البكطاش", "جزر الأمراء"],
          activities: ["رحلة بحرية في البوسفور", "زيارة جزر الأمراء"],
          hotel: null,
          notes: "أحضروا معطفاً خفيفاً للرحلة البحرية."
        },
        {
          day: 4,
          title: "القسم الآسيوي والتسوق",
          city: "اسطنبول",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["القسم الآسيوي", "مجمع زورلو", "شارعقل"],
          activities: ["جولة في القسم الآسيوي", "وقت حر للتسوق"],
          hotel: null,
          notes: "يوم مفتوح للتسوق والاستكشاف الحر."
        },
        {
          day: 5,
          title: "المغادرة",
          city: "اسطنبول",
          meals: { breakfast: true, lunch: false, dinner: false },
          visits: ["المطار"],
          activities: ["المغادرة إلى المملكة"],
          hotel: null,
          notes: "يُنصح بالوصول للمطار قبل 3 ساعات."
        }
      ],
      hotels: [
        { name: "فندق ماريوت اسطنبول", stars: 5, city: "اسطنبول", rating: 4.6, image: null, nights: 4, roomType: "غرفة سوبيرير", amenities: ["واي فاي مجاني", "سبا", "مطعم", "مسبح داخلي", "صالة رياضية", "موقع مركزي"] }
      ]
    },
    {
      id: 3,
      name: "زيارة اعتدال كربلاء والنجف",
      destination: "العراق",
      destinationEmoji: "🇮🇶",
      type: "religious",
      coverImage: null,
      dateDeparture: "2026-09-20",
      dateReturn: "2026-09-23",
      dateDisplay: "20 سبتمبر 2026",
      dateReturnDisplay: "23 سبتمبر 2026",
      nights: 3,
      days: 4,
      price: 1800,
      currency: "ر.س",
      status: ProgramStatus.LIMITED,
      statusText: ProgramStatusLabel.limited,
      emoji: "🕌",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      shortDescription: "برنامج ديني مميز لزيارة مرقد الإمام الحسين والعباس عليهما السلام",
      fullDescription: "برنامج ديني مقدم يأخذك في رحلة روحانية مميزة إلى كربلاء المقدسة والنجف الأشرف. ستزور مرقد الإمام الحسين عليه السلام ومرقد العباس عليه السلام، ثم تنتقل إلى النجف لزيارة مرقد الإمام علي عليه السلام والتجول في سوقها التراثي.",
      includedServices: ["ال[float] طيران", "الفندق", "الوجبات", "التنقلات", "المرشد الديني"],
      excludedServices: ["ال Insurance الصحي", "النفقات الشخصية", "الإكراميات"],
      bookingTerms: "يجب دفع المبلغ كاملاً عند الحجز لضمان المقعد.",
      cancellationPolicy: "إلغاء مجاني قبل 7 أيام. لا يوجد استرداد خلال أقل من 7 أيام.",
      highlights: ["مرقد الإمام الحسين", "مرقد الإمام علي", "زيارة مقبرة وادي السلام"],
      itinerary: [
        {
          day: 1,
          title: "الوصول إلى كربلاء",
          city: "كربلاء",
          meals: { breakfast: false, lunch: false, dinner: true },
          visits: ["الوصول إلى كربلاء", "زيارة مرقد الإمام الحسين عليه السلام"],
          activities: ["الانتقال إلى الفندق"],
          hotel: { name: "فندق فورمولا فايف كربلاء", stars: 4, city: "كربلاء", rating: 4.0, roomType: "غرفة قياسية", nights: 2 },
          notes: "الوصول في المساء. زيارة أولى للمرقد الحسيني."
        },
        {
          day: 2,
          title: "كربلاء المقدسة",
          city: "كربلاء",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["مرقد العباس عليه السلام", "مقبرة وادي السلام", "الحرم الحسيني"],
          activities: ["صلاة جماعة في الحرم", "زيارة المقبرة"],
          hotel: null,
          notes: "يوم كامل للعبادة والزيارة."
        },
        {
          day: 3,
          title: "النجف الأشرف",
          city: "النجف",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["مرقد الإمام علي عليه السلام", "سوق النجف التراثي", "نهر الفرات"],
          activities: ["الانتقال إلى النجف", "جولة في المدينة"],
          hotel: { name: "فندق chains النجف", stars: 4, city: "النجف", rating: 3.9, roomType: "غرفة قياسية", nights: 1 },
          notes: "الانتقال بعد الفطور. العودة في المساء."
        },
        {
          day: 4,
          title: "المغادرة",
          city: "النجف",
          meals: { breakfast: true, lunch: false, dinner: false },
          visits: ["المطار"],
          activities: ["المغادرة إلى المملكة"],
          hotel: null,
          notes: "المغادرة من مطار النجف أو مطار بغداد."
        }
      ],
      hotels: [
        { name: "فندق فورمولا فايف كربلاء", stars: 4, city: "كربلاء", rating: 4.0, image: null, nights: 2, roomType: "غرفة قياسية", amenities: ["واي فاي مجاني", "مطعم", "خدمة غرف", "موقف سيارات"] },
        { name: "فندق النجف الدولي", stars: 4, city: "النجف", rating: 3.9, image: null, nights: 1, roomType: "غرفة قياسية", amenities: ["واي فاي مجاني", "مطعم", "موقع مركزي"] }
      ]
    },
    {
      id: 4,
      name: "مغامرة جبال لبنان",
      destination: "لبنان",
      destinationEmoji: "🇱🇧",
      type: "adventure",
      coverImage: null,
      dateDeparture: "2026-10-10",
      dateReturn: "2026-10-13",
      dateDisplay: "10 أكتوبر 2026",
      dateReturnDisplay: "13 أكتوبر 2026",
      nights: 3,
      days: 4,
      price: 2500,
      currency: "ر.س",
      status: ProgramStatus.SOON,
      statusText: ProgramStatusLabel.soon,
      emoji: "⛰️",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      shortDescription: "مغامرة مثيرة في جبال لبنان مع أنشطة متنوعة وإطلالات خلابة",
      fullDescription: "مغامرة مثيرة تأخذك إلى قمم جبال لبنان حيث الطبيعة الخلابة والأنشطة المتنوعة. ستحصل على تجربة فريدة مع تلفريك بعبدة الشهير وزيارة قرى الجبل الجميلة واستكشاف الطبيعة اللبنانية الساحرة. يوم كامل في شمال لبنان مع زيارة طرابلس التاريخية.",
      includedServices: ["ال[float] طيران", "الفندق", "الفطور", "تلفريك بعبدة", "التنقلات", "المرشد السياحي"],
      excludedServices: ["ال Insurance", "الوجبات غير المشمولة", "النفقات الشخصية", "تأمين المغامرات"],
      bookingTerms: "يجب دفع دفعة مقدمة 30% عند الحجز. المبلغ الكامل قبل 14 يوم من السفر.",
      cancellationPolicy: "إلغاء مجاني قبل 14 يوم. خصم 25% خلال 7-14 يوم. لا يوجد استرداد خلال أقل من 7 أيام.",
      highlights: ["تلفريك بعبدة", "زيارة قرى الجبل", "استكشاف الطبيعة", "طرابلس التاريخية"],
      itinerary: [
        {
          day: 1,
          title: "الوصول إلى بيروت",
          city: "بيروت",
          meals: { breakfast: false, lunch: false, dinner: true },
          visits: ["الوصول إلى مطار بيروت", "جولة في وسط بيروت"],
          activities: ["الانتقال إلى الفندق", "عشاء في مطعم بحري"],
          hotel: { name: "فندق لو رويال بيروت", stars: 5, city: "بيروت", rating: 4.4, roomType: "غرفة بانورامية", nights: 3 },
          notes: "الوصول في المساء. استكشاف وسط بيروت التاريخي."
        },
        {
          day: 2,
          title: "جولة جبل لبنان",
          city: "بعبدة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["تلفريك بعبدة", "قرى جونيه", "الVDIات الطبيعية"],
          activities: ["تلفريك بعبدة", "المشي في الطبيعة"],
          hotel: null,
          notes: "أحضر ملابس دافئة. ارتفاع بعبدة حوالي 1500م."
        },
        {
          day: 3,
          title: "شمال لبنان - طرابلس",
          city: "طرابلس",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["طرابلس التاريخية", "القصيّم التاريخية", "الأسواق الشعبية"],
          activities: ["رحلة إلى طرابلس", "التسوق والتجول"],
          hotel: null,
          notes: "كبة نية في طرابلس. يوم مشمس متوقع."
        },
        {
          day: 4,
          title: "المغادرة",
          city: "بيروت",
          meals: { breakfast: true, lunch: false, dinner: false },
          visits: ["المطار"],
          activities: ["المغادرة إلى المملكة"],
          hotel: null,
          notes: "عودة إلى المطار بعد الفطور."
        }
      ],
      hotels: [
        { name: "فندق لو رويال بيروت", stars: 5, city: "بيروت", rating: 4.4, image: null, nights: 3, roomType: "غرفة بانورامية", amenities: ["واي فاي مجاني", "مسبح", "صالة رياضية", "مطعم", "إطلالة بحرية"] }
      ]
    },
    {
      id: 5,
      name: "الحرم المكي والمدني",
      destination: "السعودية",
      destinationEmoji: "🇸🇦",
      type: "religious",
      coverImage: null,
      dateDeparture: "2026-09-05",
      dateReturn: "2026-09-12",
      dateDisplay: "5 سبتمبر 2026",
      dateReturnDisplay: "12 سبتمبر 2026",
      nights: 7,
      days: 8,
      price: 4500,
      currency: "ر.س",
      status: ProgramStatus.AVAILABLE,
      statusText: ProgramStatusLabel.available,
      emoji: "🕋",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      shortDescription: "برنامج عمرة مميز يشمل الزيارة إلى المسجد النبوي الشريف",
      fullDescription: "برنامج عمرة شامل يأخذك في رحلة روحانية مميزة بين المدينة المنورة ومكة المكرمة. ستبدأ بزيارة المسجد النبوي الشريف والمعالم التاريخية في المدينة، ثم تنتقل إلى مكة المكرمة لأداء مناسك العمرة والصلاة في الحرم المكي.",
      includedServices: ["ال[float] طيران", "الفندق 5 نجوم", "الوجبات", "التنقلات", "المرشد الديني", "ustralian التأشيرة"],
      excludedServices: ["ال Insurance", "النفقات الشخصية", "الإكراميات", "السMax"],
      bookingTerms: "يجب دفع دفعة مقدمة 40% عند الحجز. السداد الكامل قبل 21 يوم من السفر.",
      cancellationPolicy: "إلغاء مجاني قبل 21 يوم. خصم 20% خلال 14-21 يوم. لا يوجد استرداد خلال أقل من 14 يوم.",
      highlights: ["عمرة", "زيارة المسجد النبوي", "جبل أحد", "جبل النور"],
      itinerary: [
        {
          day: 1,
          title: "الوصول إلى المدينة المنورة",
          city: "المدينة المنورة",
          meals: { breakfast: false, lunch: false, dinner: true },
          visits: ["الوصول إلى المدينة", "زيارة المسجد النبوي"],
          activities: ["الانتقال إلى الفندق", "صلاة في الحرم النبوي"],
          hotel: { name: "فندق دار التوحيد", stars: 5, city: "المدينة المنورة", rating: 4.7, roomType: "جناح فاخر", nights: 3 },
          notes: "الوصول في المساء. زيارة أولى للمسجد النبوي."
        },
        {
          day: 2,
          title: "جولة تاريخية في المدينة",
          city: "المدينة المنورة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["جبل أحد", "مقبرة بقيع", "مسجد قباء", "البقيع"],
          activities: ["جولة تاريخية", "صلاة في مسجد قباء"],
          hotel: null,
          notes: "يوم كامل لاستكشاف المعالم التاريخية."
        },
        {
          day: 3,
          title: "المدينة المنورة - يوم حر",
          city: "المدينة المنورة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["المسجد النبوي", "سوق المدينة"],
          activities: ["وقت حر للعبادة", "تسوق في المدينة"],
          hotel: null,
          notes: "يوم حر للعبادة والتسوق."
        },
        {
          day: 4,
          title: "الانتقال إلى مكة المكرمة",
          city: "مكة المكرمة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["الانتقال إلى مكة"],
          activities: ["الانتقال بالحافلة إلى مكة المكرمة"],
          hotel: { name: "فندق مكة هيلتون", stars: 5, city: "مكة المكرمة", rating: 4.8, roomType: "جناح مطل على الحرم", nights: 4 },
          notes: "الانتقال بعد الفطور. الوصول في المساء."
        },
        {
          day: 5,
          title: "أداء مناسك العمرة",
          city: "مكة المكرمة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["الحرم المكي", "الميقات", "الكعبة المشرفة"],
          activities: ["الإحرام من الميقات", "أداء مناسك العمرة", "طواف وسعي"],
          hotel: null,
          notes: "يوم العمرة. يُنصح بالاستعداد البدني والروحي."
        },
        {
          day: 6,
          title: "صلاة في الحرم المكي",
          city: "مكة المكرمة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["الحرم المكي"],
          activities: ["صلاة الفجر والظهر والعصر والمغرب والعشاء"],
          hotel: null,
          notes: "يوم كامل للعبادة في الحرم المكي."
        },
        {
          day: 7,
          title: "جبل النور وغار حراء",
          city: "مكة المكرمة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["جبل النور", "غار حراء", "الحرم المكي"],
          activities: ["صعود جبل النور", "زيارة غار حراء", "صلاة في الحرم"],
          hotel: null,
          notes: "صعود جبل النور يتطلب لياقة بدنية. يُنصح بارتداء ملابس رياضية."
        },
        {
          day: 8,
          title: "المغادرة",
          city: "مكة المكرمة",
          meals: { breakfast: true, lunch: false, dinner: false },
          visits: ["المطار"],
          activities: ["المغادرة إلى المملكة"],
          hotel: null,
          notes: "المغادرة من مطار الملك عبد العزيز."
        }
      ],
      hotels: [
        { name: "فندق دار التوحيد", stars: 5, city: "المدينة المنورة", rating: 4.7, image: null, nights: 3, roomType: "جناح فاخر", amenities: ["واي فاي مجاني", "مطعم", "خدمة غرف", "إطلالة على الحرم"] },
        { name: "فندق مكة هيلتون", stars: 5, city: "مكة المكرمة", rating: 4.8, image: null, nights: 4, roomType: "جناح مطل على الحرم", amenities: ["واي فاي مجاني", "مطاعم", "صالة ألعاب", "خدمة غرف", "إطلالة على الحرم"] }
      ]
    },
    {
      id: 6,
      name: "جولة عائلية في دبي",
      destination: "دبي",
      destinationEmoji: "🇦🇪",
      type: "family",
      coverImage: null,
      dateDeparture: "2026-11-01",
      dateReturn: "2026-11-05",
      dateDisplay: "1 نوفمبر 2026",
      dateReturnDisplay: "5 نوفمبر 2026",
      nights: 4,
      days: 5,
      price: 3800,
      currency: "ر.س",
      status: ProgramStatus.AVAILABLE,
      statusText: ProgramStatusLabel.available,
      emoji: "🎡",
      gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      shortDescription: "رحلة عائلية ممتعة في دبي تجمع بين المغامرة والتسوق والترفيه",
      fullDescription: "رحلة عائلية مثالية لجميع أفراد العائلة في دبي. تجمع بين المغامرة والتسوق والترفيه مع أنشطة ممتعة للأطفال والكبار. ستحظى بيوم كامل في لاغي دبي المذهل، وزيارة برج خليفة الأعلى عالياً، وحديقة معالم العالم الرائعة.",
      includedServices: ["ال[float] طيران", "الفندق 5 نجوم", "الفطور", "تذاكر لاغي دبي", "تذاكر برج خليفة", "التنقلات"],
      excludedServices: ["ال Insurance", "الوجبات غير المشمولة", "النفقات الشخصية", "تذاكر إضافية"],
      bookingTerms: "يجب دفع دفعة مقدمة 30% عند الحجز. السداد الكامل قبل 14 يوم من السفر.",
      cancellationPolicy: "إلغاء مجاني قبل 14 يوم. خصم 30% خلال 7-14 يوم.",
      highlights: ["لاغي دبي", "برج خليفة", "دبي مول", "حديقة معالم العالم"],
      itinerary: [
        {
          day: 1,
          title: "الوصول إلى دبي",
          city: "دبي",
          meals: { breakfast: false, lunch: false, dinner: true },
          visits: ["الوصول إلى مطار دبي", "التسوق في دبي مول"],
          activities: ["الانتقال إلى الفندق", "عشاء ترحيبي"],
          hotel: { name: "فندق جميرا بيتش", stars: 5, city: "دبي", rating: 4.5, roomType: "غرفة عائلية مطلة على الشاطئ", nights: 4 },
          notes: "الوصول في المساء. عشاء ترحيبي في مطعم الفندق."
        },
        {
          day: 2,
          title: "يوم لاغي دبي",
          city: "دبي",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["لاغي دبي"],
          activities: ["يوم كامل في لاغي دبي", "مشاهدة عروض المساء"],
          hotel: null,
          notes: "يوم كامل من المغامرة. أحضر ملابس استحمام وواقي شمس."
        },
        {
          day: 3,
          title: "برج خليفة والتسوق",
          city: "دبي",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["برج خليفة", "دبي مول", "نافورة دبي"],
          activities: ["صعود برج خليفة", "تسوق في دبي مول", "مشاهدة نافورة دبي"],
          hotel: null,
          notes: "حجز تذاكر برج خليفة مسبقاً مطلوب."
        },
        {
          day: 4,
          title: "حديقة معالم العالم",
          city: "دبي",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["حديقة معالم العالم", "شاطئ جميرا"],
          activities: ["زيارة حديقة معالم العالم", "وقت حر على الشاطئ"],
          hotel: null,
          notes: "آخر يوم ممتع في دبي."
        },
        {
          day: 5,
          title: "المغادرة",
          city: "دبي",
          meals: { breakfast: true, lunch: false, dinner: false },
          visits: ["المطار"],
          activities: ["المغادرة إلى المملكة"],
          hotel: null,
          notes: "المغادرة بعد الفطور."
        }
      ],
      hotels: [
        { name: "فندق جميرا بيتش", stars: 5, city: "دبي", rating: 4.5, image: null, nights: 4, roomType: "غرفة عائلية مطلة على الشاطئ", amenities: ["واي فاي مجاني", "مسبح خارجي", "شاطئ خاص", "نادي أطفال", "مطاعم عائلية", "مرافق أطفال"] }
      ]
    },
    {
      id: 7,
      name: "جولة كوالالمبور وماليزيا",
      destination: "ماليزيا",
      destinationEmoji: "🇲🇾",
      type: "tourism",
      coverImage: null,
      dateDeparture: "2026-12-15",
      dateReturn: "2026-12-22",
      dateDisplay: "15 ديسمبر 2026",
      dateReturnDisplay: "22 ديسمبر 2026",
      nights: 7,
      days: 8,
      price: 5200,
      currency: "ر.س",
      status: ProgramStatus.SOON,
      statusText: ProgramStatusLabel.soon,
      emoji: "🌴",
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      shortDescription: "اكتشف جمال ماليزيا الطبيعية وتراثها الثقافي الغني",
      fullDescription: "رحلة شاملة إلى ماليزيا تأخذك من كوالالمبور النابضة بالحياة إلى جزيرة بينانج الخلابة وcities الغارقة. ستستمتع بمزيج رائع من الثقافة والطبيعة وال  اللذيذة. زيارة البرج الشهير و والجزيرة القديمة التراثية.",
      includedServices: ["ال[float] طيران الدولي", "الفنادق", "الوجبات اليومية", "التنقلات الداخلية", "المرشد السياحي", "تذاكر الزيارة"],
      excludedServices: ["ال Insurance", "النفقات الشخصية", "الإكراميات", "التأشيرات"],
      bookingTerms: "يجب دفع دفعة مقدمة 35% عند الحجز. السداد الكامل قبل 21 يوم من السفر.",
      cancellationPolicy: "إلغاء مجاني قبل 21 يوم. خصم 25% خلال 14-21 يوم. لا يوجد استرداد خلال أقل من 14 يوم.",
      highlights: ["البرج الشهير", "جزيرة بينانج", "مدينة التاريخ", "ماليزيا"],
      itinerary: [
        {
          day: 1, title: "الوصول إلى كوالالمبور", city: "كوالالمبور",
          meals: { breakfast: false, lunch: false, dinner: true },
          visits: ["الوصول", "البرج الشهير ليلاً"], activities: ["الانتقال إلى الفندق"],
          hotel: { name: "فندق كوالالمبور رويال", stars: 5, city: "كوالالمبور", rating: 4.5, roomType: "غرفة ديلوكس", nights: 3 },
          notes: "الوصول في المساء."
        },
        {
          day: 2, title: "استكشاف كوالالمبور", city: "كوالالمبور",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["البرج الشهير", "كهوف باتو", "السوق المحلي"], activities: ["جولة في المدينة"],
          hotel: null, notes: "يوم كامل لاستكشاف كوالالمبور."
        },
        {
          day: 3, title: "جولة كوالالمبور الثقافية", city: "كوالالمبور",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["المتحف الوطني", "حديقة الأزهار", "شارع bukit"], activities: ["جولة ثقافية"],
          hotel: null, notes: "زيارة المعالم الثقافية."
        },
        {
          day: 4, title: "الانتقال إلى بينانج", city: "بينانج",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["الجزيرة القديمة"], activities: ["طيران داخلي", "جولة في الجزيرة القديمة"],
          hotel: { name: "فندق بينانج هيريتاج", stars: 5, city: "بينانج", rating: 4.6, roomType: "جناح تراثي", nights: 2 },
          notes: "الوصول في منتصف اليوم."
        },
        {
          day: 5, title: "بينانج - مالاكا", city: "بينانج",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["الجزيرة القديمة", "معبد Kek Lok Si", "الشاطئ"], activities: ["جولة في الجزيرة"],
          hotel: null, notes: "استكشاف تراث بينانج."
        },
        {
          day: 6, title: "الانتقال إلى مالاكا", city: "مالاكا",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["المدينة القديمة", "قلعة تاريخية"], activities: ["الانتقال إلى مالاكا", "جولة في المدينة القديمة"],
          hotel: { name: "فندق مالاكا كاسل", stars: 4, city: "مالاكا", rating: 4.3, roomType: "غرفة كلاسيكية", nights: 2 },
          notes: "مالاكا مدينة تراث عالمي."
        },
        {
          day: 7, title: "مالاكا التاريخية", city: "مالاكا",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["ساحة الهولنديين", "كنيسة", "نهر مالاكا"], activities: ["جولة تاريخية", "رحلة بالقارب على النهر"],
          hotel: null, notes: "آخر يوم كامل في ماليزيا."
        },
        {
          day: 8, title: "المغادرة", city: "كوالالمبور",
          meals: { breakfast: true, lunch: false, dinner: false },
          visits: ["المطار"], activities: ["المغادرة إلى المملكة"],
          hotel: null, notes: "المغادرة من مطار كوالالمبور الدولي."
        }
      ],
      hotels: [
        { name: "فندق كوالالمبور رويال", stars: 5, city: "كوالالمبور", rating: 4.5, image: null, nights: 3, roomType: "غرفة ديلوكس", amenities: ["واي فاي مجاني", "مسبح", "صالة رياضية", "مطعم", "سبا"] },
        { name: "فندق بينانج هيريتاج", stars: 5, city: "بينانج", rating: 4.6, image: null, nights: 2, roomType: "جناح تراثي", amenities: ["واي فاي مجاني", "مطعم", "إطلالة بحرية", "موقع مركزي"] },
        { name: "فندق مالاكا كاسل", stars: 4, city: "مالاكا", rating: 4.3, image: null, nights: 2, roomType: "غرفة كلاسيكية", amenities: ["واي فاي مجاني", "مطعم", "مسبح"] }
      ]
    },
    {
      id: 8,
      name: "حجز Özel رحلة مكة VIP",
      destination: "السعودية",
      destinationEmoji: "🇸🇦",
      type: "special",
      coverImage: null,
      dateDeparture: "2026-09-01",
      dateReturn: "2026-09-10",
      dateDisplay: "1 سبتمبر 2026",
      dateReturnDisplay: "10 سبتمبر 2026",
      nights: 9,
      days: 10,
      price: 12000,
      currency: "ر.س",
      status: ProgramStatus.FULL,
      statusText: ProgramStatusLabel.full,
      emoji: "✨",
      gradient: "linear-gradient(135deg, #f5af19 0%, #f12711 100%)",
      shortDescription: "رحلة VIP خاصة إلى مكة والمدينة بأعلى معايير الفخامة",
      fullDescription: "تجربة VIP استثنائية لمن يبحث عن الفخامة والراحة المطلقة. تشمل الإقامة في أفخم الفنادق المطلة على الحرم المكي والنبوي، مع مرشد ديني خاص وتنقلات بسيارات فاخرة ووجبات في أفضل المطاعم.",
      includedServices: ["ال[float] طيران الدرجة الأولى", "الفنادق VIP", "الوجبات في أفخم المطاعم", "سيارة فاخرة مع سائق", "مرشد ديني خاص", "تأمين شامل"],
      excludedServices: ["النفقات الشخصية الزائدة"],
      bookingTerms: "حجز خاص. يُطلب سداد كامل المبلغ عند الحجز.",
      cancellationPolicy: "لا يوجد استرداد. يمكن تحويل الحجز لمرة أخرى خلال 30 يوم.",
      highlights: ["إقامة مطلة على الحرم", "سيارة فاخرة", "مرشد ديني خاص", "وجبات VIP"],
      itinerary: [
        {
          day: 1, title: "الوصول إلى المدينة المنورة", city: "المدينة المنورة",
          meals: { breakfast: false, lunch: false, dinner: true },
          visits: ["الاستقبال VIP", "المسجد النبوي"], activities: ["تنقل بسيارة فاخرة"],
          hotel: { name: "فندقelve شيراتون المدينة", stars: 5, city: "المدينة المنورة", rating: 4.9, roomType: "جناح ملكي", nights: 4 },
          notes: "استقبال خاص في المطار."
        },
        {
          day: 2, title: "المدينة المنورة - يوم حر", city: "المدينة المنورة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["المسجد النبوي", "جبل أحد", "مسجد قباء"], activities: ["وقت حر للعبادة"],
          hotel: null, notes: "يوم حر مع مرشد خاص."
        },
        {
          day: 3, title: "المدينة المنورة", city: "المدينة المنورة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["المسجد النبوي"], activities: ["صلاة في الحرم النبوي"],
          hotel: null, notes: "يوم كامل للعبادة."
        },
        {
          day: 4, title: "المدينة المنورة", city: "المدينة المنورة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["المدينة القديمة"], activities: ["جولة تاريخية"],
          hotel: null, notes: "جولة في المعالم التاريخية."
        },
        {
          day: 5, title: "الانتقال إلى مكة المكرمة", city: "مكة المكرمة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["الحرم المكي"], activities: ["تنقل فاخر إلى مكة"],
          hotel: { name: "فندق أبراج البيت", stars: 5, city: "مكة المكرمة", rating: 4.9, roomType: "جناح بانورامي مطل على الكعبة", nights: 5 },
          notes: "الانتقال بسيارة فاخرة."
        },
        {
          day: 6, title: "أداء العمرة", city: "مكة المكرمة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["الحرم المكي", "الكعبة"], activities: ["أداء مناسك العمرة"],
          hotel: null, notes: "مرشد خاص معك طوال الوقت."
        },
        {
          day: 7, title: "صلاة في الحرم المكي", city: "مكة المكرمة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["الحرم المكي"], activities: ["صلاة في الحرم"],
          hotel: null, notes: "يوم كامل للعبادة."
        },
        {
          day: 8, title: "جبل النور", city: "مكة المكرمة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["جبل النور", "غار حراء"], activities: ["صعود جبل النور"],
          hotel: null, notes: "يُنصح باللياقة البدنية."
        },
        {
          day: 9, title: "آخر يوم في مكة", city: "مكة المكرمة",
          meals: { breakfast: true, lunch: true, dinner: true },
          visits: ["الحرم المكي"], activities: ["صلاة وعبادة"],
          hotel: null, notes: "آخر يوم للعبادة."
        },
        {
          day: 10, title: "المغادرة", city: "مكة المكرمة",
          meals: { breakfast: true, lunch: false, dinner: false },
          visits: ["المطار"], activities: ["المغادرة VIP"],
          hotel: null, notes: "استقبال VIP في المطار."
        }
      ],
      hotels: [
        { name: "فندق فيروز المدينة", stars: 5, city: "المدينة المنورة", rating: 4.9, image: null, nights: 4, roomType: "جناح ملكي", amenities: ["واي فاي مجاني", "مطعم خاص", "خدمة شخصية", "إطلالة على الحرم"] },
        { name: "فندق أبراج البيت", stars: 5, city: "مكة المكرمة", rating: 4.9, image: null, nights: 5, roomType: "جناح بانورامي مطل على الكعبة", amenities: ["واي فاي مجاني", "مطاعم فاخرة", "خدمة شخصية 24/7", "إطلالة مباشرة على الكعبة"] }
      ]
    }
  ],

  menuItems: [
    { id: "profile", label: "حسابي", desc: "إدارة بياناتك الشخصية", icon: "👤", color: "var(--color-primary-50)", link: "#" },
    { id: "orders", label: "طلباتي", desc: "متابعة حجوزاتك", icon: "📦", color: "var(--color-warning-bg)", link: "#" },
    { id: "notifications", label: "الإشعارات", desc: "تنبيهات وعروض", icon: "🔔", color: "var(--color-warning-bg)", link: "#", badge: 3 },
    { id: "favorites", label: "المفضلة", desc: "البرامج المحفوظة", icon: "❤️", color: "var(--color-error-bg)", link: "#" },
    { id: "settings", label: "إعدادات الحساب", desc: "تخصيص تجربتك", icon: "⚙️", color: "var(--color-info-bg)", link: "#" },
    { id: "about", label: "من نحن", desc: "تعرف على شركتنا", icon: "ℹ️", color: "var(--color-success-bg)", link: "#" },
    { id: "contact", label: "تواصل معنا", desc: "نحن هنا لمساعدتك", icon: "📞", color: "var(--color-primary-50)", link: "#" },
    { id: "branches", label: "الفروع", desc: "مواقع مكاتبنا", icon: "🏢", color: "var(--color-warning-bg)", link: "#" },
    { id: "privacy", label: "سياسة الخصوصية", desc: "حماية بياناتك", icon: "🔒", color: "var(--color-surface-variant)", link: "#" },
    { id: "terms", label: "الشروط والأحكام", desc: "شروط الاستخدام", icon: "📄", color: "var(--color-surface-variant)", link: "#" }
  ]
};
