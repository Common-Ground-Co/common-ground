// Seed data for the studios table used by config/reset.js.
const studios = [
  {
    name: "Visceral Dance Center",
    neighborhood: "Avondale",
    address: "3121 N Rockwell St, Chicago, IL 60618",
    website: "https://www.visceraldance.com/",
    schedule_url: "https://www.visceraldance.com/classschedule",
    instagram: "@visceraldancecenter",
    style:
      "Tap, Hip-Hop, Open Style, Ballet, Jazz, Jazz Fusion, Jazz Funk, Modern, Contemporary, Heels, Theatre Jazz, Contemporary Jazz, Street Style",
    levels_offered: "Beginner Friendly, Intermediate, Advanced",
    price_range: "$18-$20 per class",
    classpass: false,
    photo_url: "https://i.imgur.com/27piA1D.png",
    photo_url_studio_space:
      "https://static.wixstatic.com/media/1e80fe_4259d6d505a94ae193485e157edece05~mv2.jpg/v1/fill/w_824,h_745,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1e80fe_4259d6d505a94ae193485e157edece05~mv2.jpg",
    polaroid_photo_url: "https://i.imgur.com/GoeIVK9.png",
    about_studio:
      "Visceral is a Chicago studio, company, and creative community rolled into one, described by the Chicago Reader as a combination of art, family, and a community that continues to grow. On the class side, Visceral offers programs for every kind of dancer: adult classes, youth programs, a trainee program, and intensives or workshops throughout the year. On the performance side, the company is known for accessible, dynamic shows that draw a wide audience. Chicago Stage Standard credited it with breathing life into the Chicago arts community. The facility itself is a premier space with six large studios and a convertible performance theater. Every studio has professional flooring, mirrors, sound, and individual climate control, plus dressing rooms, a lobby, kitchen, and lounge areas for rental clients.",
    banner_photo_url:
      "https://static.wixstatic.com/media/979242_5115169ef4ad475b8aa476f7b8b9fb9e~mv2.jpg/v1/fill/w_2048,h_1265,al_c,q_90,enc_avif,quality_auto/979242_5115169ef4ad475b8aa476f7b8b9fb9e~mv2.jpg",
    curator_review:
      "Visceral has a strong class lineup with genuinely talented teachers. My favorites are Gabe on Wednesdays and Alex Salgado every other Monday at 7pm. The main downside is pricing. Classes run 18 dollars for 1hr15 and 20 dollars for 1hr30, which is steeper than most studios in the area. The packages do not really pay off unless you are committing to mostly 1hr30 classes. Otherwise you are locked into 170 to 320 dollars upfront with an expiration date, and any missed classes are money lost. It is worth it if you can reliably hit 10 classes in 3 months, or if there is a teacher you love who only teaches at Visceral. Otherwise, comparable classes can be found elsewhere for less.",
    best_for:
      "From college students pursuing dance seriously to adults dancing purely for fun, this studio has something for everyone — complete beginners, casual hobbyists, and advanced dancers alike. If you've never danced before, classes like Andrew Tamez-Hull on Thursdays (7:15–8:30pm) and Gabe Stacey on Wednesdays (7:45–9pm) are great places to start building your foundation and getting your foot in the door.",
    work_study: true,
    work_study_url: "https://www.visceraldance.com/workstudyprogram",
    approved: true,
  },
  {
    name: "The Puzzle Box Dance Studio",
    neighborhood: "Avondale",
    address: "3360 N Elston Ave, Chicago, IL 60618",
    website: "https://www.thepuzzleboxdancestudio.com/",
    schedule_url: "https://www.thepuzzleboxdancestudio.com/book-by-calendar",
    instagram: "@thepuzzleboxdancestudio",
    style:
      "Open Style, Hip-Hop, Burlesque Hip-Hop, K-Pop, Jazz, Jazz Fusion, Jazz Funk, Contemporary, Heels, Foundational Classes, Lyrical, R&B",
    levels_offered: "Beginner Friendly, Intermediate, Advanced",
    price_range: "$10-$16 per class",
    classpass: false,
    photo_url:
      "https://static.wixstatic.com/media/a01b38_2c8f6c43ebc843898ce7e530b9249814~mv2_d_2048_1365_s_2.jpg/v1/fill/w_1692,h_1128,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/a01b38_2c8f6c43ebc843898ce7e530b9249814~mv2_d_2048_1365_s_2.jpg",
    photo_url_studio_space:
      "https://img.p.mapq.st/?url=https%3A%2F%2Fs3-media0.fl.yelpcdn.com%2Fbphoto%2FCJcsILHOmFJBfBy_dwHhoQ%2Fl.jpg&w=3840&q=75",
    polaroid_photo_url:
      "https://static.wixstatic.com/media/a01b38_9f1693ccbfc942508891b641c30d1a1f~mv2.jpg/v1/fill/w_1170,h_1033,al_c,q_85,enc_auto/a01b38_9f1693ccbfc942508891b641c30d1a1f~mv2.jpg",
    about_studio:
      "Puzzle Box is a Chicago-based studio that's equal parts dance school, performance company, and tight-knit community. It's home to three resident companies — Puzzle Box Dance Company, The PieceMakers, and The Puzzle League — all specializing in competitive urban choreography across age groups. Between them, they've racked up championship titles at local competitions and major events like World of Dance and Prelude. Beyond the competitive side, Puzzle Box offers classes to share what they love with the wider community, with a particular focus on developing the next generation of dancers. Every instructor is certified to teach across all levels, so whether someone is chasing technique, working on fitness, or just looking for a fun way to move, there's a class for them. For adults, the studio runs weekly classes and pop-up classes — both open to anyone, anytime. Kids' classes are open enrollment for the first half of the season, then close in the second half as students prep for their annual recital. The studio also rents out rehearsal space and is always rolling out new offerings.",
    banner_photo_url: "https://i.imgur.com/alRoasi.jpeg",
    curator_review:
      "I have been at Puzzle Box for a year and a half, regularly taking classes with Andrew Phan, Nikhilesh Thota, Rachmaries, and more recently Matt Pumanes and Bryan. The community is what really sets it apart. I have made close friends and had experiences here I would not have found anywhere else. The studio also runs three audition based teams (The Puzzle League, The PieceMakers, and Puzzle Box Dance Company) for dancers who want to compete, perform, and go deeper. Every class is filmed, which is great for building confidence, posting content, or studying technique. The space comfortably fits 40 dancers, and even when popular classes hit 60, teachers split the floor into groups so no one is cramped.",
    best_for:
      "Anyone from complete beginners to advanced dancers dancing professionally or at a competitive level. College students, casual hobbyists, adults dancing for fun — all welcome. If you've never danced before, Andrew's biweekly Wednesday class at 8:30pm and Nik's class every Saturday at 4:15pm are great entry points. Gabby's Heels Foundations every other Tuesday at 6pm is also beginner-friendly for anyone new to heels specifically. Nik's class varies between choreography, drills, and technique work. Andrew always does choreography and films every class for confidence building.",
    work_study: true,
    work_study_url: "thepuzzleboxdancestudio@gmail.com",
    approved: true,
  },
  {
    name: "The Hive",
    neighborhood: "Placeholder",
    address: "Placeholder",
    website: "https://www.thehive.dance/",
    schedule_url: "TBD",
    instagram: "TBD",
    style: "Ballet, Lyrical, Contemporary, Jazz, K-Pop, Hip-Hop, Tap",
    levels_offered: "Placeholder",
    price_range: "TBD",
    classpass: false,
    photo_url:
      "https://images.squarespace-cdn.com/content/v1/5927ce5adb29d63a65e17cd1/1636172920715-VRIXJ3K5ZRV33LGB64JI/_DSC2620.jpg?format=1000w",
    photo_url_studio_space:
      "https://www.tagvenue.com/resize/202512/c1/a3/widen-1680-noupsize;105290-room-1-room-pEGupFXH.jpg",
    polaroid_photo_url:
      "https://classpass-res.cloudinary.com/image/upload/f_auto/q_auto/ykpazazr89ozq7tk74zp.jpg",
    about_studio: "Placeholder",
    banner_photo_url: "https://i.imgur.com/uF8IY2F.png",
    curator_review: "Placeholder",
    best_for: "Placeholder",
    work_study: false,
    work_study_url: "TBD",
    approved: true,
  },
  {
    name: "Indie Media Studio",
    neighborhood: "Placeholder",
    address: "Placeholder",
    website: "https://www.indiemediastudio.com/",
    schedule_url: "TBD",
    instagram: "TBD",
    style: "Placeholder",
    levels_offered: "Placeholder",
    price_range: "TBD",
    classpass: false,
    photo_url: "https://i.imgur.com/5NTrgcA.png",
    photo_url_studio_space:
      "https://static.wixstatic.com/media/499aa8_0d711b462d0946ce96568afe452ee9e3~mv2.jpg/v1/fill/w_793,h_513,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/499aa8_0d711b462d0946ce96568afe452ee9e3~mv2.jpg",
    polaroid_photo_url: "https://i.imgur.com/NkNSgPQ.png",
    about_studio: "Placeholder",
    banner_photo_url: "https://i.imgur.com/6X1bhZc.jpeg",
    curator_review: "Placeholder",
    best_for: "Placeholder",
    work_study: false,
    work_study_url: "TBD",
    approved: true,
  },
];

export default studios;
