import React from 'react';

const westJavaQuestions = [
  {
    category: "Makanan",
    questions: [
      "Apa nama makanan khas Bandung yang terbuat dari singkong dan berbentuk bulat pipih?",
      "Sebutkan nama sate khas Purwakarta yang terbuat dari daging kambing muda!",
      "Apa nama makanan khas Sumedang yang terbuat dari tahu yang digoreng dua kali?",
      "Sebutkan nama kue tradisional khas Cirebon yang berbentuk seperti bunga teratai!",
      "Apa nama makanan khas Garut yang terbuat dari singkong dan biasanya dimakan dengan oncom?"
    ]
  },
  {
    category: "Minuman",
    questions: [
      "Apa nama minuman khas Bandung yang terbuat dari susu dan sirup cocopandan?",
      "Sebutkan nama minuman tradisional Sunda yang terbuat dari air kelapa muda dan gula aren!",
      "Apa nama minuman khas Bogor yang terbuat dari sari kacang hijau?",
      "Sebutkan nama minuman khas Jawa Barat yang terbuat dari serutan es dan berbagai macam sirup!",
      "Apa nama minuman tradisional Sunda yang terbuat dari air rebusan daun ceremai?"
    ]
  },
  {
    category: "Budaya",
    questions: [
      "Apa nama tarian tradisional khas Jawa Barat yang menggambarkan gerak-gerik merak?",
      "Sebutkan nama alat musik tradisional Sunda yang terbuat dari bambu dan ditiup!",
      "Apa nama upacara adat Sunda yang dilakukan untuk memperingati 7 bulan kehamilan?",
      "Sebutkan nama seni bela diri tradisional khas Jawa Barat!",
      "Apa nama wayang khas Cirebon yang dimainkan oleh seorang dalang?"
    ]
  },
  {
    category: "Tempat Wisata",
    questions: [
      "Apa nama gunung berapi aktif yang terletak di perbatasan Kabupaten Garut dan Bandung?",
      "Sebutkan nama danau vulkanik yang terletak di Kabupaten Bandung Barat!",
      "Apa nama pantai di Sukabumi yang terkenal dengan batu karangnya yang unik?",
      "Sebutkan nama air terjun tertinggi di Jawa Barat yang terletak di Kabupaten Sumedang!",
      "Apa nama kebun teh terkenal di Bandung yang sering dijadikan lokasi syuting film?"
    ]
  }
];

export const getRandomQuestion = () => {
  const randomCategory = westJavaQuestions[Math.floor(Math.random() * westJavaQuestions.length)];
  const randomQuestion = randomCategory.questions[Math.floor(Math.random() * randomCategory.questions.length)];
  return {
    category: randomCategory.category,
    question: randomQuestion
  };
};

export default westJavaQuestions;