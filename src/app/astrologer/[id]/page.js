import { prisma } from "@/lib/prisma";
import StartChatButton from "@/components/StartChatButton";

const ASTROLOGER_DETAILS = {
  "Guru Vashisht": {
    experience: "18+",
    languages: ["Hindi", "English", "Sanskrit"],
    reviewsCount: "2.4k",
    about:
      "Guru Vashisht is a senior Vedic astrologer known for Career, Business, Marriage and Financial Astrology. He gives practical guidance through Kundli analysis, Graha Dasha and simple remedies.",
    reviews: [
      {
        text: "Predictions about my business situation were very accurate.",
        name: "Rohit Singh",
      },
      {
        text: "Very calm guidance during a difficult financial phase.",
        name: "Neha Gupta",
      },
    ],
  },

  "Acharya Dev": {
    experience: "12+",
    languages: ["Hindi", "English"],
    reviewsCount: "1.8k",
    about:
      "Acharya Dev specializes in Love, Relationship, Marriage compatibility and Family matters. His consultations are simple, practical and focused on clear spiritual remedies.",
    reviews: [
      {
        text: "Excellent marriage guidance and compatibility reading.",
        name: "Priya Verma",
      },
      {
        text: "Very humble and genuine astrologer.",
        name: "Saurabh Jain",
      },
    ],
  },

  "Acharya Gayatri": {
    experience: "15+",
    languages: ["Hindi", "English"],
    reviewsCount: "2.1k",
    about:
      "Acharya Gayatri is known for guidance around family, emotional well-being, pregnancy-related astrology and relationship concerns. Her approach is gentle, clear and reassuring.",
    reviews: [
      {
        text: "Her guidance helped me during a stressful family phase.",
        name: "Anjali Sharma",
      },
      {
        text: "Very comforting and accurate consultation.",
        name: "Megha Kapoor",
      },
    ],
  },

  "Pandit Somesh": {
    experience: "14+",
    languages: ["Hindi"],
    reviewsCount: "1.6k",
    about:
      "Pandit Somesh focuses on Career, Government Jobs, Competitive Exams, Education and professional growth through Vedic Astrology and Dasha-based guidance.",
    reviews: [
      {
        text: "Helped me understand my career direction clearly.",
        name: "Abhishek Yadav",
      },
      {
        text: "Very detailed guidance for exam and job prospects.",
        name: "Nitin Kumar",
      },
    ],
  },

  "Acharya Kavya": {
    experience: "11+",
    languages: ["Hindi", "English"],
    reviewsCount: "1.4k",
    about:
      "Acharya Kavya specializes in Love, Relationship, Marriage, emotional healing and compatibility guidance. Her readings are warm, practical and easy to understand.",
    reviews: [
      {
        text: "Relationship guidance was extremely helpful.",
        name: "Simran Kaur",
      },
      {
        text: "Very understanding and accurate reading.",
        name: "Ritika Sharma",
      },
    ],
  },

  "Guru Anand": {
    experience: "20+",
    languages: ["Hindi", "English", "Sanskrit"],
    reviewsCount: "3.2k",
    about:
      "Guru Anand has deep experience in Spiritual Astrology, Karma Analysis, Graha Dasha interpretation and advanced Vedic remedies. He is known for mature and peaceful guidance.",
    reviews: [
      {
        text: "Deep spiritual insights unlike any astrologer I consulted.",
        name: "Vivek Mishra",
      },
      {
        text: "Extremely knowledgeable and accurate.",
        name: "Rajesh Gupta",
      },
    ],
  },
};

const DEFAULT_PROFILE = {
  experience: "10+",
  languages: ["Hindi", "English"],
  reviewsCount: "1.2k",
  about:
    "Expert astrologer offering guidance on relationships, career, finance, marriage, family matters and spiritual growth through personalized astrology consultation.",
  reviews: [
    {
      text: "Very accurate prediction and calm guidance.",
      name: "Priya Sharma",
    },
    {
      text: "Helped me understand my situation clearly.",
      name: "Aman Verma",
    },
  ],
};

export default async function AstrologerProfilePage({ params }) {
  const resolvedParams = await params;
  const astrologerId = Number(resolvedParams.id);

  const astrologer = await prisma.astrologer.findUnique({
    where: {
      id: astrologerId,
    },
  });

  if (!astrologer) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F7EFE4]">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Astrologer Not Found</h1>

          <a
            href="/"
            className="inline-block mt-4 px-6 py-3 rounded-xl bg-[#24110A] text-white"
          >
            Go Home
          </a>
        </div>
      </main>
    );
  }

  const profile = ASTROLOGER_DETAILS[astrologer.name] || DEFAULT_PROFILE;

  return (
    <main
      className="min-h-screen bg-[#F7EFE4] text-[#1F130D]"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-[#FFF8EF] via-[#F7E9D9] to-[#EED8BE]">
        <div className="relative h-[360px] overflow-hidden">
          <img
            src={astrologer.image}
            alt={astrologer.name}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#1A0E09] via-[#1A0E0920] to-transparent" />

          <div className="absolute top-5 left-4">
            <a
              href="/"
              className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white text-xl"
            >
              ←
            </a>
          </div>

          <div className="absolute bottom-5 left-5 right-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#E5C8B2] font-semibold">
                  Verified Astrologer
                </p>

                <h1 className="text-4xl font-extrabold tracking-[-0.04em] mt-1">
                  {astrologer.name}
                </h1>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-sm font-bold shadow-lg ${
                  astrologer.online
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {astrologer.online ? "Online" : "Offline"}
              </div>
            </div>

            <p className="text-[#E9D4C6] mt-3 text-sm leading-6">
              {astrologer.skills}
            </p>
          </div>
        </div>

        <div className="px-4 -mt-7 relative z-20">
          <div className="bg-white/45 backdrop-blur-2xl border border-white/60 rounded-[34px] p-5 shadow-2xl">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/50 rounded-2xl p-3 border border-white/60">
                <p className="text-2xl font-extrabold">
                  {astrologer.rating}
                </p>

                <p className="text-xs text-[#7A5A45] font-bold mt-1">
                  Rating
                </p>
              </div>

              <div className="bg-white/50 rounded-2xl p-3 border border-white/60">
                <p className="text-2xl font-extrabold">
                  {profile.experience}
                </p>

                <p className="text-xs text-[#7A5A45] font-bold mt-1">
                  Years
                </p>
              </div>

              <div className="bg-white/50 rounded-2xl p-3 border border-white/60">
                <p className="text-2xl font-extrabold">₹{astrologer.price}</p>

                <p className="text-xs text-[#7A5A45] font-bold mt-1">
                  Per Min
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.22em] text-[#8A5A35] font-bold mb-3">
                About
              </p>

              <p className="text-[15px] leading-7 text-[#5F483A] font-medium">
                {profile.about}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.22em] text-[#8A5A35] font-bold mb-3">
                Languages
              </p>

              <div className="flex gap-2 flex-wrap">
                {profile.languages.map((language) => (
                  <span
                    key={language}
                    className="bg-white/50 border border-white/60 rounded-full px-4 py-2 text-sm font-bold"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#8A5A35] font-bold">
                  User Reviews
                </p>

                <h2 className="text-2xl font-extrabold tracking-[-0.03em]">
                  Testimonials
                </h2>
              </div>

              <span className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-full px-4 py-2 text-sm font-bold">
                {profile.reviewsCount} Reviews
              </span>
            </div>

            <div className="space-y-3">
              {profile.reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-3xl p-4"
                >
                  <p className="font-bold">"{review.text}"</p>

                  <p className="text-sm text-[#7A5A45] mt-2">
                    — {review.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 pt-6 pb-6 bg-gradient-to-t from-[#EFDCC8] to-transparent mt-8">
            {astrologer.online ? (
              <StartChatButton astrologerId={astrologer.id} />
            ) : (
              <button
                disabled
                className="w-full py-4 rounded-2xl bg-gray-400 text-white font-semibold shadow-xl text-lg cursor-not-allowed"
              >
                Currently Offline
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}