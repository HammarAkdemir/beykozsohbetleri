import { Conversation, ShortVideo, User, LiveStream, Highlight } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Harun Akdemir',
    username: 'H.Akdemir',
    email: 'harunakdemir@gmail.com',
    role: 'admin',
    status: 'approved',
    registeredAt: '2026-08-01T10:00:00Z',
    phone: '+90 555 123 4567',
    notes: 'Platform Kurucusu & Baş Yöneticisi',
  },
  {
    id: 'user-1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@ornek.com',
    role: 'member',
    status: 'approved',
    registeredAt: '2026-08-15T14:30:00Z',
    phone: '+90 532 987 6543',
    notes: 'Aktif okuyucu, edebiyat grubu',
  },
  {
    id: 'user-2',
    name: 'Elif Kaya',
    email: 'elif@ornek.com',
    role: 'member',
    status: 'approved',
    registeredAt: '2026-08-20T09:15:00Z',
    phone: '+90 544 555 1122',
    notes: 'Felsefe & Düşünce sohbetleri takipçisi',
  },
  {
    id: 'user-3',
    name: 'Mehmet Demir',
    email: 'mehmet@ornek.com',
    role: 'member',
    status: 'pending',
    registeredAt: '2026-09-02T16:45:00Z',
    phone: '+90 505 444 3322',
    notes: 'Üyelik başvurusu yaptı, onay bekliyor.',
  },
  {
    id: 'user-4',
    name: 'Ayşe Karaca',
    email: 'ayse@ornek.com',
    role: 'member',
    status: 'pending',
    registeredAt: '2026-09-03T08:20:00Z',
    phone: '+90 533 111 2233',
    notes: 'Tavsiye ile başvurdu.',
  },
  {
    id: 'user-5',
    name: 'Kemal Akın',
    email: 'kemal@ornek.com',
    role: 'member',
    status: 'suspended',
    registeredAt: '2026-07-10T11:00:00Z',
    notes: 'Topluluk kurallarına aykırı davranış nedeniyle askıya alındı.',
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'sohbet-1',
    title: 'Gönül Dili ve Samimiyet Üzerine',
    category: 'Maneviyat & Ahlak',
    speaker: 'Mehmet Ali Hoca',
    date: '28 Ağustos 2026',
    estimatedMinutes: 6,
    order: 1,
    description: 'İnsan ilişkilerinde sözün tesirini artıran içtenlik, kalp temizliği ve hakiki dinleme sanatı üzerine derin bir hasbihal.',
    paragraphs: [
      {
        id: 'p-1-1',
        subtitle: 'Sözün Özü ve Tesiri',
        text: 'Kelimeler, ağızdan çıktığı yere göre muhatabında yer bulur. Dilden çıkan söz kulağa kadar giderken; gönülden, yürekten süzülen samimi bir kelam doğrudan bir başka kalbe ulaşır. Günümüz dünyasında en büyük eksikliğimiz çok konuşmak değil, konuştuklarımıza ruhumuzu ve içtenliğimizi katamamaktır.'
      },
      {
        id: 'p-1-2',
        subtitle: 'Sükûtun ve Dinlemenin Hikmeti',
        text: 'Dinlemek, pasif bir eylem değildir; bilakis muhatabına varlık alanı açan en yüksek nezaket biçimidir. Bir insanı sadece cevap vermek için değil, onun halini idrak etmek için dinlediğinizde aradaki mesafeler erir. Sessizliğin içindeki derin manayı kavrayamayan kimse, sözün ağırlığını da taşıyamaz.',
        quote: {
          text: 'Söz gümüşse sükût altındır; zira sükût kelimelerin tükendiği yer değil, mananın en saf ve dupduru haliyle kalpten kalbe aktığı kutlu bir tefekkür havzasıdır.',
          source: 'Hz. Mevlânâ Celâleddîn-i Rûmî'
        }
      },

      {
        id: 'p-1-3',
        subtitle: 'Zamanın Hızında Sabır',
        text: 'Her şeyin hızla tüketildiği, sabrın azaldığı bir çağda yaşıyoruz. Oysa hakiki olgunluk ve hikmet tohumları yavaş yavaş, demlenerek yeşerir. Acelecilik fikri yüzeyselleştirirken; tefekkür ve sabır ruha derinlik, muhabbete ise sebat kazandırır.'
      },
      {
        id: 'p-1-4',
        subtitle: 'Gönül Aynasını Temiz Tutmak',
        text: 'İnsanın kalbi bir ayna gibidir. O aynada neyin tecelli etmesini istiyorsanız, aynayı kirleten benlik, kibir ve haset tozlarını arındırmanız gerekir. Aynası temiz olan insan, etrafındaki her şeyde bir güzellik, her insanda bir hakikat kırıntısı görür.'
      }
    ]
  },
  {
    id: 'sohbet-2',
    title: 'Modern Dünyada Anlam Arayışı ve Sadakat',
    category: 'Felsefe & Düşünce',
    speaker: 'Dr. Selim Yıldız',
    date: '21 Ağustos 2026',
    estimatedMinutes: 8,
    order: 2,
    description: 'Tüketim kültürü ve dijital karmaşa arasında insanın kendi varlığını, hakikat bağını ve vefa duygusunu yeniden keşfetmesi.',
    paragraphs: [
      {
        id: 'p-2-1',
        subtitle: 'Gürültü Çağında İç Ses',
        text: 'Sürekli bildirimlerin, görsel uyaranların ve sonu gelmeyen içerik bombardımanının ortasında insan en çok kendi iç sesini duymakta zorlanıyor. Yalnız kalmaktan korktuğumuz için sürekli bir gürültüye sığınıyoruz. Oysa yalnızlık ile kendiyle baş başa kalabilme gücü (halvet) birbirinden tamamen farklıdır.'
      },
      {
        id: 'p-2-2',
        subtitle: 'Vefa ve Sadakatin Kıymeti',
        text: 'Sadakat sadece bir insana bağlı kalmak değildir; insanın kendi ilkelerine, hakikate ve kendine verdiği söze vefa göstermesidir. Şartlar değiştikçe yön değiştiren kimse değil, fırtınalara rağmen pusulasını doğrudan yana sabitleyen insan güven inşa edebilir.'
      },
      {
        id: 'p-2-3',
        subtitle: 'Eşyaya Mahkûm Olmamak',
        text: 'Eşyanın hizmetkârı değil, efendisi olabilmek asıl hürriyettir. İhtiyaçlarımız ile heveslerimiz arasındaki sınırı kaybettiğimiz anda, sahip olduğumuzu sandığımız şeyler bize sahip olmaya başlar. Sadeleşmek, sadece eşyadan değil, zihindeki fazlalıklardan da arınmaktır.'
      }
    ]
  },
  {
    id: 'sohbet-3',
    title: 'Zaman Şuuru ve Günlük Hayatta Denge',
    category: 'Kişisel Gelişim & Tefekkür',
    speaker: 'Mehmet Ali Hoca',
    date: '14 Ağustos 2026',
    estimatedMinutes: 5,
    order: 3,
    description: 'Zamanın bereketini yakalama, anın hakkını verme ve hayatın koşturmacasında iç huzuru koruma prensipleri.',
    paragraphs: [
      {
        id: 'p-3-1',
        subtitle: 'İbnu\'l-Vakt Olmak (Vaktin Çocuğu)',
        text: 'Kadim gelenekte bilge insanlara "vaktin çocuğu" denirdi. Bu, geçmişin pişmanlıklarına hapsolmadan ve geleceğin kaygılarına boğulmadan, içinde bulunulan anın gerektirdiği vazifeyi en güzel şekilde yapabilmektir. Şu an elimizdeki yegane sermaye bu nefestir.'
      },
      {
        id: 'p-3-2',
        subtitle: 'Bereketin Kaynağı Niyet',
        text: 'Zaman herkese 24 saat olarak eşit verilmiştir. Fakat bazı insanların gününe koca bir ömür sığarken, bazılarının yılları heba olur. Farkı oluşturan şey niyetin saffeti ve ameldeki sürekliliktir. Az da olsa devamlı olan hayır, dağlar gibi yığılıp kalan temennilerden üstündür.'
      },
      {
        id: 'p-3-3',
        subtitle: 'Huzurlu Bir Akşam Değerlendirmesi',
        text: 'Günün sonunda başını yastığa koymadan önce birkaç dakikalık samimi bir muhasebe insanı diri tutar: Bugün kime faydam dokundu? Kimi incittim? Ruhumu hangi güzellikle doyurdum? Bu sorular yarınımızı bugünden daha aydınlık kılar.'
      }
    ]
  },
  {
    id: 'sohbet-4',
    title: 'Adalet, Merhamet ve Toplumsal Birliktelik',
    category: 'Toplum & Ahlak',
    speaker: 'Av. Harun Erdem',
    date: '05 Ağustos 2026',
    estimatedMinutes: 7,
    order: 4,
    description: 'Birlikte yaşama kültüründe adaletin merhametle dengelenmesi ve ortak vicdanın inşası.',
    paragraphs: [
      {
        id: 'p-4-1',
        subtitle: 'Hakkı Ayakta Tutmak',
        text: 'Adalet yalnızca mahkeme salonlarında dağıtılan bir kural bütünü değildir; sokakta, sofrada, işte ve ailede hakkı sahibine teslim etmektir. Merhametsiz adalet zulme, adaletsiz merhamet ise kaosa yol açar. İkisi birleştiğinde medeniyet doğar.'
      },
      {
        id: 'p-4-2',
        subtitle: 'Farklılıklara Rağmen Birlik',
        text: 'Bir ormandaki ağaçlar birbirine benzemez fakat aynı topraktan beslenir. İnsanlar da farklı mizaçlara sahip olabilir; mühim olan ortak insani değerlerde ve iyilik zemininde buluşabilmektir.'
      }
    ]
  }
];

export const INITIAL_VIDEOS: ShortVideo[] = [
  {
    id: 'video-1',
    title: 'Gönülden Konuşmanın 3 Temel Sırrı',
    description: 'Sözün tesirini artıran içtenlik ve dinleme adabı hakkında 2 dakikalık kısa özet.',
    duration: '01:45',
    videoUrl: '/videos/short1.mp4',
    assignedConversationIds: ['sohbet-1', 'sohbet-3'],
    createdAt: '2026-08-28T12:00:00Z',
  },
  {
    id: 'video-2',
    title: 'Gürültü Çağında İç Sessizliği Bulmak',
    description: 'Dijital karmaşadan sıyrılıp kendi iç sesini dinlemek isteyenler için kısa tefekkür rehberi.',
    duration: '02:10',
    videoUrl: '/videos/short2.mp4',
    assignedConversationIds: ['sohbet-2'],
    createdAt: '2026-08-22T15:30:00Z',
  },
  {
    id: 'video-3',
    title: 'Vaktin Bereketi Nasıl Yakalanır?',
    description: 'Günün 24 saatini verimli kılmanın ve niyeti diri tutmanın püf noktaları.',
    duration: '01:55',
    videoUrl: '/videos/short3.mp4',
    assignedConversationIds: ['sohbet-1', 'sohbet-3'],
    createdAt: '2026-08-15T18:00:00Z',
  }
];

export const INITIAL_HIGHLIGHTS: Highlight[] = [
  {
    id: 'hl-1',
    userId: 'user-admin',
    conversationId: 'sohbet-1',
    conversationTitle: 'Gönül Dili ve Samimiyet Üzerine',
    paragraphId: 'p-1-1',
    selectedText: 'Dilden çıkan söz kulağa kadar giderken; gönülden, yürekten süzülen samimi bir kelam doğrudan bir başka kalbe ulaşır.',
    color: 'amber',
    note: 'Çok etkileyici bir tespit. Günlük konuşmalarımızda bunu hatırlamalıyız.',
    createdAt: '2026-08-29T10:30:00Z'
  },
  {
    id: 'hl-2',
    userId: 'user-admin',
    conversationId: 'sohbet-1',
    conversationTitle: 'Gönül Dili ve Samimiyet Üzerine',
    paragraphId: 'p-1-2',
    selectedText: 'Dinlemek, pasif bir eylem değildir; bilakis muhatabına varlık alanı açan en yüksek nezaket biçimidir.',
    color: 'emerald',
    note: 'Dinleme sanatı üzerine mühim bir ilke.',
    createdAt: '2026-08-29T10:35:00Z'
  },
  {
    id: 'hl-3',
    userId: 'user-admin',
    conversationId: 'sohbet-2',
    conversationTitle: 'Modern Dünyada Anlam Arayışı ve Sadakat',
    paragraphId: 'p-2-3',
    selectedText: 'Sadeleşmek, sadece eşyadan değil, zihindeki fazlalıklardan da arınmaktır.',
    color: 'sky',
    note: 'Zihinsel sadeleşme.',
    createdAt: '2026-08-30T14:10:00Z'
  }
];

export const INITIAL_LIVESTREAM: LiveStream = {
  isLive: true,
  title: 'Haftalık Hasbihal: Gönül Coğrafyamız ve Manevi Sorumluluklarımız',
  description: 'Değerli katılımcılarımızla birlikte canlı Zoom yayını üzerinden soru-cevap ve sohbet meclisi.',
  scheduledDate: '3 Eylül 2026 Perşembe',
  scheduledTime: '21:00 (Canlı Yayında)',
  activeViewerCount: 47,
};
