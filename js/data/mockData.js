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
    { id: 1, name: "إيران", emoji: "🇮🇷", gradient: "linear-gradient(135deg, #1B3A5C 0%, #2C5F8A 100%)", programCount: 3 }
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
      name: "كروب ايران البري (قم - مشهد - كاشان)",
      destination: "إيران",
      destinationEmoji: "🇮🇷",
      type: "religious",
      coverImage: "images/iran-bari.png",
      dateDeparture: null,
      dateReturn: null,
      dateDisplay: "قريباً",
      dateReturnDisplay: "قريباً",
      nights: 11,
      days: 12,
      price: 0,
      currency: "ج.د",
      status: ProgramStatus.AVAILABLE,
      statusText: ProgramStatusLabel.available,
      emoji: "🕌",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      shortDescription: "برنامج ديني سياحي شامل (3 ليالي قم - 4 ليالي مشهد) يشمل زيارة كاشان وشلالات نياسر والمزارات الدينية",
      fullDescription: "برنامج ديني سياحي شامل في إيران يأخذك في جولة مميزة بين قم ومشهد وكاشان. يشمل زيارة مرقد السيدة معصومة وبيت النور وأربعين علوية وجامع جمكران في قم، ثم زيارة مرقد الإمام الرضا عليه السلام و儿子 مشهد والجولات الدينية وال سياحية.",
      includedServices: ["تنقلات داخلية", "الفنادق", "الإرشاد الديني"],
      excludedServices: ["تذاكر الطيران", "التأمين الصحي", "النفقات الشخصية", "الوجبات (stdio إيراني داخل الفندق عند الرغبة)"],
      bookingTerms: "للمزيد من المعلومات الاتصال على الأرقام التالية.",
      cancellationPolicy: "في حال ترك المسافر الكروب لأي سبب كان لا يتم إرجاع المبلغ له.",
      highlights: ["زيارة مرقد السيدة معصومة", "بيت النور وأربعين علوية", "جامع جمكران", "زيارة شلالات نياسر في كاشان", "زيارة مرقد الإمام الرضا عليه السلام", "جولة في مشهد الدينية"],
      itinerary: [
        {
          day: 1,
          title: "الإنطلاق من الشركة",
          city: "العراق",
          meals: { breakfast: false, lunch: false, dinner: false },
          visits: [],
          activities: ["الإنطلاق من الشركة"],
          hotel: null,
          notes: ""
        },
        {
          day: 2,
          title: "الوصول إلى مدينة قم",
          city: "قم",
          meals: { breakfast: false, lunch: false, dinner: true },
          visits: ["تسليم الغرف بعد الساعة 2 ظهراً", "زيارة السيدة معصومة اخت الإمام الرضا عليه السلام"],
          activities: ["الوصول إلى قم", "استراحة مع زيارة السيدة معصومة"],
          hotel: { name: "فندق", stars: 3, city: "قم", rating: 3.5, roomType: "غرفة قياسية", nights: 3 },
          notes: "تسليم الغرف بعد الساعة 2 ظهراً."
        },
        {
          day: 3,
          title: "جولات دينية في قم والذهاب إلى كاشان",
          city: "قم / كاشان",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["بيت النور", "أربعين علوية", "جامع جمكران", "شلالات نياسر في كاشان"],
          activities: ["جولات دينية صباحاً في قم", "الذهاب عصراً إلى كاشان وزيارة شلالات نياسر"],
          hotel: null,
          notes: "جولة دينية صباحاً ثم الذهاب إلى كاشان في العصر."
        },
        {
          day: 4,
          title: "الإنطلاق إلى مشهد",
          city: "قم / مشهد",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["زيارة أنيس النفوس علي بن موسى الرضا عليه السلام"],
          activities: ["الإنطلاق بعد الساعة 2 ظهراً إلى مشهد", "زيارة مرقد الإمام الرضا عليه السلام"],
          hotel: { name: "فندق", stars: 4, city: "مشهد", rating: 4.0, roomType: "غرفة قياسية", nights: 4 },
          notes: "الإنطلاق بعد الساعة 2 ظهراً."
        },
        {
          day: 5,
          title: "الوصول إلى مشهد",
          city: "مشهد",
          meals: { breakfast: false, lunch: false, dinner: true },
          visits: ["تسليم الغرف بعد الساعة 2 ظهراً", "زيارة الإمام الرضا عليه السلام"],
          activities: ["الوصول إلى مشهد وتسليم الغرف", "زيارة الإمام الرضا عليه السلام"],
          hotel: null,
          notes: "تسليم الغرف بعد الساعة 2 ظهراً."
        },
        {
          day: 6,
          title: "جولة دينية في مدينة ميامي",
          city: "ميامي",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["زيارة السيد يحيى بن زيد بن علي عليه السلام"],
          activities: ["الذهاب صباحاً في جولة دينية إلى مدينة ميامي"],
          hotel: null,
          notes: "جولة دينية في مدينة ميامي."
        },
        {
          day: 7,
          title: "جولة دينية وسياحية",
          city: "مشهد",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["زيارة السيدين ياسر وناصر إخوة الإمام الرضا عليه السلام", "حديقة وكيل آباد", "حديقة الحيوانات", "حديقة باغ مشهد"],
          activities: ["جولة دينية وسياحية صباحاً", "زيارة الحدائق والمنتزهات"],
          hotel: null,
          notes: "جولة دينية وسياحية تشمل زيارة الإخوة والحدائق، ثم عصراً الذهاب إلى حديقة باغ مشهد."
        },
        {
          day: 8,
          title: "رحلة اختيارية",
          city: "مشهد",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["المدينة المائية"],
          activities: ["رحلة اختيارية إلى المدينة المائية"],
          hotel: null,
          notes: "رحلة اختيارية."
        },
        {
          day: 9,
          title: "المغادرة من مشهد إلى قم",
          city: "مشهد / قم",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: [],
          activities: ["الخروج من مشهد متوجهين إلى مدينة قم"],
          hotel: null,
          notes: "الخروج من مشهد صباحاً."
        },
        {
          day: 10,
          title: "الوصول إلى قم",
          city: "قم",
          meals: { breakfast: false, lunch: false, dinner: true },
          visits: ["تسليم الغرف بعد الساعة 2 ظهراً"],
          activities: ["الوصول إلى مدينة قم وتسليم الغرف"],
          hotel: { name: "فندق", stars: 3, city: "قم", rating: 3.5, roomType: "غرفة قياسية", nights: 1 },
          notes: "تسليم الغرف بعد الساعة 2 ظهراً."
        },
        {
          day: 11,
          title: "التوجه إلى العراق",
          city: "قم",
          meals: { breakfast: true, lunch: false, dinner: false },
          visits: [],
          activities: ["التوجه إلى العراق بعد الظهر"],
          hotel: null,
          notes: "التوجه بعد الظهر."
        },
        {
          day: 12,
          title: "الوصول إلى أرض الوطن",
          city: "العراق",
          meals: { breakfast: false, lunch: false, dinner: false },
          visits: [],
          activities: ["الوصول إلى العراق"],
          hotel: null,
          notes: "الوصول إلى أرض الوطن."
        }
      ],
      hotels: [
        { name: "فندق قم", stars: 3, city: "قم", rating: 3.5, image: null, nights: 4, roomType: "غرفة قياسية", amenities: ["واي فاي مجاني", "مطعم"] },
        { name: "فندق مشهد", stars: 4, city: "مشهد", rating: 4.0, image: null, nights: 4, roomType: "غرفة قياسية", amenities: ["واي فاي مجاني", "مطعم"] }
      ]
    },
    {
      id: 2,
      name: "كروب ايران جوا (قم - مشهد)",
      destination: "إيران",
      destinationEmoji: "🇮🇷",
      type: "religious",
      coverImage: "images/iran-jawwa.png",
      dateDeparture: null,
      dateReturn: null,
      dateDisplay: "قريباً",
      dateReturnDisplay: "قريباً",
      nights: 5,
      days: 6,
      price: 0,
      currency: "ج.د",
      status: ProgramStatus.AVAILABLE,
      statusText: ProgramStatusLabel.available,
      emoji: "✈️",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      shortDescription: "برنامج جوي (2 ليالي قم / 5 ليالي مشهد) يشمل المزارات الدينية والجولات السياحية والتسوق في مشهد",
      fullDescription: "برنامج جوي مميز يأخذك في جولة بين قم ومشهد. يشمل زيارة المزارات الدينية في قم وجولات سياحية في مشهد تشمل طرقبة وجايدراه وحديقة وكيل آباد وحديقة الحيوانات وحديقة بارك ملت وحديقة باغ مشهد والمولات.",
      includedServices: ["تنقلات داخلية", "الفنادق", "الإرشاد الديني"],
      excludedServices: ["تذاكر الطيران", "التأمين الصحي", "النفقات الشخصية", "الوجبات (تضاف 100 دولار للبوفيه)"],
      bookingTerms: "للمزيد من المعلومات الاتصال على الأرقام التالية.",
      cancellationPolicy: "في حال ترك المسافر الكروب لأي سبب كان لا يتم إرجاع المبلغ له.",
      highlights: ["زيارة السيدة معصومة", "بيت النور وأربعين علوية", "جامع جمكران", "زيارة الإمام الرضا عليه السلام", "جولة في طرقبة وجايدراه", "حديقة باغ مشهد"],
      itinerary: [
        {
          day: 1,
          title: "الإنطلاق والوصول إلى قم",
          city: "قم",
          meals: { breakfast: false, lunch: false, dinner: true },
          visits: ["تسليم الغرف بعد الساعة 2 ظهراً", "زيارة السيدة معصومة اخت الإمام الرضا عليه السلام"],
          activities: ["الإنطلاق من الشركة", "الوصول إلى مدينة قم", "زيارة السيدة معصومة"],
          hotel: { name: "فندق قم", stars: 3, city: "قم", rating: 3.5, roomType: "غرفة قياسية", nights: 2 },
          notes: "تسليم الغرف بعد الساعة 2 ظهراً."
        },
        {
          day: 2,
          title: "جولات دينية في قم",
          city: "قم",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["بيت النور", "أربعين علوية", "جامع جمكران"],
          activities: ["جولات دينية صباحاً"],
          hotel: null,
          notes: "جولات دينية في قم."
        },
        {
          day: 3,
          title: "مغادرة قم والوصول إلى مشهد",
          city: "قم / مشهد",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["زيارة أنيس النفوس علي بن موسى الرضا عليه السلام"],
          activities: ["مغادرة قم", "الوصول إلى مشهد والذهاب لزيارة الإمام الرضا عليه السلام"],
          hotel: { name: "فندق انتخاب", stars: 4, city: "مشهد", rating: 4.0, roomType: "غرفة قياسية", nights: 4 },
          notes: "الوصول إلى مشهد واستلام الغرف بعد الساعة 2 ظهراً."
        },
        {
          day: 4,
          title: "جولة سياحية في طرقبة وجايدراه",
          city: "مشهد",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["مدينة طرقبة", "جايدراه", "مطعم عنبران بلبل", "حديقة وكيل آباد", "حديقة الحيوانات"],
          activities: ["جولة سياحية في طرقبة وجايدراه", "تناول الغذاء في مطعم عنبران بلبل", "زيارة الحدائق"],
          hotel: null,
          notes: "جولة سياحية ممتعة مع الألعاب والمطاعم والحدائق."
        },
        {
          day: 5,
          title: "حديقة بارك ملت والمدينة المائية",
          city: "مشهد",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["حديقة بارك ملت", "المدينة المائية"],
          activities: ["الذهاب صباحاً إلى حديقة بارك ملت", "عصراً رحلة اختيارية إلى المدينة المائية"],
          hotel: null,
          notes: "حديقة بارك ملت صباحاً ورحلة اختيارية للمدينة المائية عصراً."
        },
        {
          day: 6,
          title: "حديقة باغ مشهد والمغادرة",
          city: "مشهد",
          meals: { breakfast: true, lunch: false, dinner: false },
          visits: ["حديقة باغ مشهد", "مولات مشهد"],
          activities: ["جولة في حديقة باغ مشهد ووقت حر", "جولات في مولات مشهد", "المغادرة"],
          hotel: null,
          notes: "حديقة باغ مشهد صباحاً ثم جولات في المولات ثم المغادرة."
        }
      ],
      hotels: [
        { name: "فندق قم", stars: 3, city: "قم", rating: 3.5, image: null, nights: 2, roomType: "غرفة قياسية", amenities: ["واي فاي مجاني", "مطعم"] },
        { name: "فندق انتخاب", stars: 4, city: "مشهد", rating: 4.0, image: null, nights: 4, roomType: "غرفة قياسية", amenities: ["واي فاي مجاني", "مطعم", "بوفيه"] }
      ]
    },
    {
      id: 3,
      name: "كروب ايران جوا (شمال ايران + مشهد)",
      destination: "إيران",
      destinationEmoji: "🇮🇷",
      type: "tourism",
      coverImage: "images/iran-north.jpg",
      dateDeparture: null,
      dateReturn: null,
      dateDisplay: "قريباً",
      dateReturnDisplay: "قريباً",
      nights: 6,
      days: 7,
      price: 0,
      currency: "ج.د",
      status: ProgramStatus.AVAILABLE,
      statusText: ProgramStatusLabel.available,
      emoji: "🌿",
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      shortDescription: "برنامج سياحي ديني (3 ليالي شمال ايران + 4 ليالي مشهد) يشمل رشت وفومن وقلعة رودخان وماسولة وبندر انزلي",
      fullDescription: "برنامج سياحي ديني مميز يأخذك في جولة رائعة بين شمال إيران ومشهد. يشمل زيارة رشت وفومن وقلعة رودخان وقرية ماسولة الجبلية وبندر انزلي السياحية وركوب القارب في مستنقع انزلي لرؤية زهور اللوتس والطيور المهاجرة، ثم الانتقال إلى مشهد لزيارة الإمام الرضا عليه السلام والجولات السياحية.",
      includedServices: ["تنقلات داخلية", "الفنادق", "الإرشاد السياحي والديني"],
      excludedServices: ["تذاكر الطيران", "التأمين الصحي", "النفقات الشخصية", "الوجبات (تضاف 100 دولار للبوفيه)"],
      bookingTerms: "للمزيد من المعلومات الاتصال على الأرقام التالية.",
      cancellationPolicy: "في حال ترك المسافر الكروب لأي سبب كان لا يتم إرجاع المبلغ له.",
      highlights: ["قلعة رودخان وصعود القلعة", "قرية ماسولة الجبلية", "ركوب القارب في مستنقع انزلي", "زهور اللوتس والطيور المهاجرة", "زيارة الإمام الرضا عليه السلام", "حديقة باغ مشهد"],
      itinerary: [
        {
          day: 1,
          title: "الوصول إلى مدينة رشت",
          city: "رشت",
          meals: { breakfast: false, lunch: false, dinner: true },
          visits: ["تسليم الغرف بعد الساعة 2 ظهراً", "جولة سياحية في الأسواق"],
          activities: ["الوصول إلى رشت", "تسليم الغرف", "جولة في الأسواق"],
          hotel: { name: "فندق ارام", stars: 3, city: "رشت", rating: 3.5, roomType: "غرفة قياسية", nights: 1 },
          notes: "فندق ارام 3 نجوم في رشت أو فندق خزر 4 نجوم في رودسر."
        },
        {
          day: 2,
          title: "قلعة رودخان",
          city: "رودخان",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["قلعة رودخان التاريخية"],
          activities: ["الإنطلاق صباحاً", "صعود قلعة رودخان والاستمتاع بالمناظر والمياه الجارية"],
          hotel: { name: "فندق فومن", stars: 3, city: "فومن", rating: 3.5, roomType: "غرفة قياسية", nights: 2 },
          notes: "سحر التاريخ في قلعة رودخان."
        },
        {
          day: 3,
          title: "قرية ماسولة وبندر انزلي",
          city: "ماسولة / انزلي",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["قرية ماسولة الجبلية", "بندر انزلي", "مستنقع انزلي التالاب"],
          activities: ["الإنطلاق صباحاً إلى قرية ماسولة", "السير في الأزقة الحجرية والضباب والوديان", "عصراً الذهاب إلى بندر انزلي وركوب القارب لرؤية زهور اللوتس والطيور المهاجرة"],
          hotel: null,
          notes: "تجربة ممتعة للعوائل في قرية ماسولة وبندر انزلي."
        },
        {
          day: 4,
          title: "الوصول إلى مشهد",
          city: "مشهد",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["زيارة أنيس النفوس علي بن موسى الرضا عليه السلام"],
          activities: ["الانتقال إلى مشهد", "استلام الغرف بعد الساعة 2 ظهراً", "زيارة الإمام الرضا عليه السلام"],
          hotel: { name: "فندق انتخاب", stars: 4, city: "مشهد", rating: 4.0, roomType: "غرفة قياسية", nights: 4 },
          notes: "فندق انتخاب 4 نجوم. استلام الغرف بعد الساعة 2 ظهراً."
        },
        {
          day: 5,
          title: "جولة سياحية في طرقبة وجايدراه",
          city: "مشهد",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["مدينة طرقبة", "جايدراه", "مطعم عنبران بلبل", "حديقة وكيل آباد", "حديقة الحيوانات"],
          activities: ["جولة سياحية في طرقبة وجايدراه والألعاب", "تناول الغذاء في مطعم عنبران بلبل", "زيارة حديقة وكيل آباد وحديقة الحيوانات"],
          hotel: null,
          notes: "جولة سياحية ممتعة."
        },
        {
          day: 6,
          title: "حديقة بارك ملت والمدينة المائية",
          city: "مشهد",
          meals: { breakfast: true, lunch: false, dinner: true },
          visits: ["حديقة بارك ملت", "المدينة المائية"],
          activities: ["الذهاب صباحاً إلى حديقة بارك ملت", "عصراً رحلة اختيارية إلى المدينة المائية"],
          hotel: null,
          notes: "حديقة بارك ملت صباحاً ورحلة اختيارية عصراً."
        },
        {
          day: 7,
          title: "حديقة باغ مشهد والمغادرة",
          city: "مشهد",
          meals: { breakfast: true, lunch: false, dinner: false },
          visits: ["حديقة باغ مشهد"],
          activities: ["ذهاب حديقة باغ مشهد والمناظر والألعاب", "وقت حر", "المغادرة"],
          hotel: null,
          notes: "آخر يوم في مشهد. المغادرة بعد ذلك."
        }
      ],
      hotels: [
        { name: "فندق ارام", stars: 3, city: "رشت", rating: 3.5, image: null, nights: 1, roomType: "غرفة قياسية", amenities: ["واي فاي مجاني", "مطعم"] },
        { name: "فندق فومن", stars: 3, city: "فومن", rating: 3.5, image: null, nights: 2, roomType: "غرفة قياسية", amenities: ["واي فاي مجاني", "مطعم"] },
        { name: "فندق انتخاب", stars: 4, city: "مشهد", rating: 4.0, image: null, nights: 4, roomType: "غرفة قياسية", amenities: ["واي فاي مجاني", "مطعم", "بوفيه"] }
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
