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
    price_range: "$18-$20 per class",
    classpass: false,
    photo_url:
      "https://static.wixstatic.com/media/aa39d2_e0135bb3164d4443ac768552f988c1de~mv2.jpg/v1/fill/w_988,h_833,al_r,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/aa39d2_e0135bb3164d4443ac768552f988c1de~mv2.jpg",
    photo_url_studio_space:
      "https://static.wixstatic.com/media/1e80fe_4259d6d505a94ae193485e157edece05~mv2.jpg/v1/fill/w_824,h_745,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1e80fe_4259d6d505a94ae193485e157edece05~mv2.jpg",
    curator_review:
      "This studio offers a solid lineup of classes with genuinely good teachers — some of my favorites are Gabe on Wednesdays and Alex Salgado every other Monday at 7pm. My main gripe is the pricing. Classes are charged by duration: 1hr15 runs $18 and 1hr30 runs $20, which is on the pricier side compared to other studios. The class packages are underwhelming — they only make sense if you plan to exclusively take 1hr30 classes. If most of the classes you want are $18, you save a little, but the upfront cost is essentially a commitment: miss enough classes and you're out $170 or $320 depending on the pack, with an expiration date to boot. If you can guarantee 10 classes in 3 months, it's worth considering — but given the price point, there are other studios offering equally strong classes for less. If you find a teacher there that you absolutely love and exclusively teaches at Visceral, it's worth it too.",
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
    price_range: "$10-$16 per class",
    classpass: false,
    photo_url:
      "https://static.wixstatic.com/media/a01b38_cf83c24c04824f7ab43fb1a634977f2c~mv2.jpg/v1/fill/w_979,h_552,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/a01b38_cf83c24c04824f7ab43fb1a634977f2c~mv2.jpg",
    photo_url_studio_space:
      "https://img.p.mapq.st/?url=https%3A%2F%2Fs3-media0.fl.yelpcdn.com%2Fbphoto%2FCJcsILHOmFJBfBy_dwHhoQ%2Fl.jpg&w=3840&q=75",
    curator_review:
      "I've been going to PuzzleBox for 1.5 years and regularly take classes with Andrew Phan, Nikhilesh Thota, Rachmaries, and more recently Matt Pumanes and Bryan. The community here is the real standout — I've met a lot of friends and had experiences I wouldn't have found elsewhere. The studio also has dance teams including The Puzzle League, The Peacemakers, and the PuzzleBox Dance Company, which are groups people can audition to join to compete, perform at showcases, and build a deeper dance community. Every class is filmed, which you can use for confidence building, social content, or studying your own technique. The space itself is large — comfortably fits 40, and even when popular classes push to 60, teachers break groups up so everyone still has room to dance.",
    best_for:
      "Anyone from complete beginners to advanced dancers dancing professionally or at a competitive level. College students, casual hobbyists, adults dancing for fun — all welcome. If you've never danced before, Andrew's biweekly Wednesday class at 8:30pm and Nik's class every Saturday at 4:15pm are great entry points. Gabby's Heels Foundations every other Tuesday at 6pm is also beginner-friendly for anyone new to heels specifically. Nik's class varies between choreography, drills, and technique work. Andrew always does choreography and films every class for confidence building.",
    work_study: true,
    work_study_url: "mailto:thepuzzleboxdancestudio@gmail.com",
    approved: true,
  },
];

export default studios;
