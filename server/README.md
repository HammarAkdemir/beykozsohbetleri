# Beykoz Sohbetleri — yerel çalışma

Önce `pnpm install`, ardından `pnpm build` çalıştırın. `python3 server/app.py` ile http://127.0.0.1:4173 adresinden açın. İlk açılışta yerel yönetici hesabınızı oluşturun. Örnek/demo hesaplar giriş yetkisine sahip değildir. Sonraki kayıtlar yönetici onayı bekler.

Sunucu SQLite veritabanını ve yüklenen videoları server/data altında saklar. Bu klasörü yedekleyin; kaynak deposuna eklemeyin. Notlar hesaba bağlıdır. Yeni frontend derlemelerinden sonra sunucuyu yeniden başlatmak gerekmez.

Word: .docx dosyaları desteklenir. Paragraflar, Word başlık ve alıntı stilleri, kalın/italik/altı çizili metinler ve liste öğeleri okunabilir biçimde aktarılır. Sayfa düzeni, resimler, tablo geometrisi ve Word'e özgü tüm tipografi birebir kopyalanmaz; tablo hücrelerindeki paragraflar okuma sırasıyla aktarılır. Eski .doc dosyaları Word'de .docx olarak kaydedilmelidir.

Zoom: Toplantı 8369840665 için resmi Meeting SDK kullanılır. Sağlanan katılım URL'sindeki pwd değeri gerçek toplantı şifresi değildir. ZOOM_SDK_KEY, ZOOM_SDK_SECRET ve gerçek ZOOM_PASSCODE sunucu ortamında tanımlanmalıdır; sırları VITE_ değişkenlerine veya kaynak koda koymayın. Yayın ayarlarından yayını açık konuma getirin. SDK izinleri ve toplantı sahibinin hesabı Zoom tarafından doğrulanır; toplantı bağlantısı tek başına yeterli değildir. SDK, izleyiciyi toplantıya katılan bir kullanıcı olarak bağlar; pasif ve toplantı ayrıntıları ağ seviyesinde görünmeyen bir yayın için ayrıca yayın akışı altyapısı gerekir. Kimlikler ve parola arayüzde gösterilmez. Kamera/mikrofon izinleri tarayıcı/Zoom tarafından yönetilir. Gerçek toplantı bağlantısı gerekli kimlik bilgileri olmadan test edilememiştir.

Bu sunucu localhost kullanımına yöneliktir. İnternete açmadan önce HTTPS, Secure çerezler, istek/hatalı giriş sınırlaması, yedekleme, hesap kurtarma ve üretim sunucusu kurulumu yapılmalıdır. İlk yönetici kurulumu yalnızca loopback bağlantısından yapılabilir.
