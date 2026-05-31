const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const astrologers = [
  // Male astrologers
  {
    name: "Acharya Devendra Shastri",
    skills: "Vedic Astrology, Kundli, Marriage",
    price: 25,
    rating: 4.9,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/ChatGPT_Image_May_31_2026_09_40_49_AM.png?v=1780201727",
  },
  {
    name: "Pandit Rajesh Trivedi",
    skills: "Career, Finance, Business",
    price: 30,
    rating: 4.8,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/ChatGPT_Image_May_31_2026_09_43_37_AM.png?v=1780201727",
  },
  {
    name: "Acharya Harish Bhardwaj",
    skills: "Lal Kitab, Remedies, Kundli",
    price: 24,
    rating: 4.7,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/ChatGPT_Image_May_31_2026_09_44_43_AM.png?v=1780201727",
  },
  {
    name: "Guru Shashank Mishra",
    skills: "Career, Job, Business",
    price: 28,
    rating: 4.8,
    online: false,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/ChatGPT_Image_May_31_2026_10_15_50_AM.png?v=1780205597",
  },
  {
    name: "Pandit Mohan Upadhyay",
    skills: "Kundli Matching, Remedies",
    price: 32,
    rating: 4.9,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/ChatGPT_Image_May_31_2026_10_59_30_AM.png?v=1780205597",
  },
  {
    name: "Guru Prakash Iyer",
    skills: "Business Astrology, Vastu",
    price: 35,
    rating: 4.8,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/ChatGPT_Image_May_31_2026_10_16_55_AM.png?v=1780205599",
  },
  {
    name: "Acharya Suresh Sharma",
    skills: "Vedic Astrology, Puja Remedies",
    price: 26,
    rating: 4.7,
    online: false,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/ChatGPT_Image_May_31_2026_09_41_58_AM.png?v=1780201727",
  },
  {
    name: "Pandit Omprakash Tiwari",
    skills: "Grah Dosh, Kundli, Remedies",
    price: 29,
    rating: 4.8,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/ChatGPT_Image_May_31_2026_10_59_36_AM.png?v=1780205597",
  },
  {
    name: "Guru Raghav Sharma",
    skills: "Vastu, Wealth, Business",
    price: 31,
    rating: 4.9,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/ChatGPT_Image_May_31_2026_10_14_27_AM.png?v=1780205597",
  },
  {
    name: "Acharya Mahesh Tripathi",
    skills: "Property, Career, Finance",
    price: 34,
    rating: 4.7,
    online: false,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/ChatGPT_Image_May_31_2026_09_41_15_AM.png?v=1780201727",
  },
  {
    name: "Pandit Anand Kulkarni",
    skills: "Vastu, Wealth, Career",
    price: 27,
    rating: 4.8,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/ChatGPT_Image_May_31_2026_10_18_22_AM.png?v=1780205597",
  },
  {
    name: "Guru Keshav Joshi",
    skills: "Marriage, Kundli, Love",
    price: 23,
    rating: 4.7,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/ChatGPT_Image_May_31_2026_09_40_40_AM.png?v=1780201727",
  },
  {
    name: "Acharya Vinayak Rao",
    skills: "Numerology, Career, Remedies",
    price: 26,
    rating: 4.8,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/ChatGPT_Image_May_31_2026_09_40_56_AM.png?v=1780201727",
  },

  // Female astrologers
  {
    name: "Acharya Priya Menon",
    skills: "Tarot, Numerology, Love",
    price: 24,
    rating: 4.8,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/Acharya_Priya.png?v=1780202028",
  },
  {
    name: "Acharya Nidhi Sharma",
    skills: "Palmistry, Numerology, Remedies",
    price: 20,
    rating: 4.8,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/Acharya_Nidhi_Sharma.png?v=1780202059",
  },
  {
    name: "Acharya Bhavna Patel",
    skills: "Love, Career, Numerology",
    price: 20,
    rating: 4.7,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/Acharya_Bhavna_patel.png?v=1780202219",
  },
  {
    name: "Acharya Ritu Kapoor",
    skills: "Spiritual Guidance, Tarot",
    price: 23,
    rating: 4.7,
    online: false,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/Acharya_Ritu_Kapoor.png?v=1780202247",
  },
  {
    name: "Acharya Kavita Rao",
    skills: "Family, Marriage, Love",
    price: 21,
    rating: 4.9,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/Acharya_Kavita_Rao.png?v=1780202268",
  },
  {
    name: "Acharya Meera Joshi",
    skills: "Tarot, Love, Relationship",
    price: 22,
    rating: 4.9,
    online: true,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/Acharya_Priya.png?v=1780202028",
  },
  {
    name: "Acharya Suman Verma",
    skills: "Love, Relationship, Marriage",
    price: 19,
    rating: 4.9,
    online: false,
    image: "https://cdn.shopify.com/s/files/1/0720/2678/3983/files/Acharya_Bhavna_patel.png?v=1780202219",
  },
];

async function main() {
  const existingAstrologers = await prisma.astrologer.findMany({
    orderBy: {
      id: "asc",
    },
  });

  for (let i = 0; i < existingAstrologers.length; i++) {
    const data = astrologers[i % astrologers.length];

    await prisma.astrologer.update({
      where: {
        id: existingAstrologers[i].id,
      },
      data,
    });
  }

  console.log(`${existingAstrologers.length} astrologers updated successfully`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });