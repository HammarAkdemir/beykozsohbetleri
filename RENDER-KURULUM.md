# Beykoz Sohbetleri: Render hesap sahibine kurulum notları

GitHub kod aktarımı, mevcut üyeleri, notları ve yüklenen dosyaları taşımaz. Aşağıdaki ayarlar Render hesabının sahibi tarafından uygulanmalı ve gerçek yayında doğrulanmalıdır.

## 1. Güncellemeden önce verileri koruyun

Mevcut Render veritabanı ve yüklemelerinin yedeğini alın. Yerel içerikler de kullanılacaksa `server/data/beykoz.sqlite` ve `server/data/uploads` klasörünün ayrı yedeğini alın. Yedeklerde kişisel bilgiler ve şifre özetleri bulunduğundan GitHub'a yüklemeyin.

Ücretli web hizmetinde kalıcı diskin bağlı olduğunu doğrulayın. Projedeki `render.yaml`, `/var/data` bağlantı yolunda 1 GB disk ve `BEYKOZ_DATA=/var/data` tanımlar. Video hacmine göre kapasiteyi değerlendirin. Mevcut hizmette bu ayarların gerçekten uygulandığını kontrol edin; yalnızca dosyayı GitHub'a göndermek yeterli bir doğrulama değildir.

Boş diske geçmeden önce mevcut verileri taşıyın. Yerel ve canlı ortamda ayrı üyeler veya içerikler varsa veritabanlarını doğrudan birbirinin üzerine yazmayın; birleştirme planı gerekir. Sunucu durdurularak alınmış tutarlı yedek veya SQLite yedekleme yöntemi kullanın.

## 2. Hizmetin kod ve çalıştırma ayarları

- Depo: `HammarAkdemir/beykozsohbetleri`, dal: `main`.
- Derleme: `npm install && npm run build`.
- Başlatma: `python3 server/app.py`.
- Ortam: Python; derleme ortamında Node.js ve npm de bulunmalıdır.
- GitHub güncellemesinden sonra doğru sürümün dağıtıldığını hizmet günlüklerinden doğrulayın.

## 3. Yönetici hesabı

Render ortam değişkenleri:

- `BEYKOZ_ADMIN_NAME`: `Harun Akdemir`
- `BEYKOZ_ADMIN_USERNAME`: `h.akdemir`
- `BEYKOZ_ADMIN_PASSWORD`: hesap sahibinin özel olarak belirlediği, en az 10 karakterlik şifre

Şifreyi GitHub dosyalarına veya issue'larına koymayın. Kullanıcı adı ve şifre birlikte tanımlandığında sunucu açılışında yönetici oluşturulur veya mevcut hesabın şifresi bu değerle güncellenir. İlk giriş doğrulandıktan sonra `BEYKOZ_ADMIN_PASSWORD` değişkenini kaldırın; aksi takdirde panelde değiştirilen şifre sonraki yeniden başlatmada eski ortam değerine döner. Veritabanı kalıcı diskte tutulmalıdır.

## 4. Zoom bağlantısı

Render'a `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_MEETING_NUMBER` ve `ZOOM_PASSCODE` değerlerini tanımlayın. Toplantı numarası mevcut yapılandırmada `8369840665` olarak ayarlıdır. `ZOOM_PASSCODE` gerçek toplantı parolasıdır; davet bağlantısındaki kodlanmış `pwd` değeri değildir.

Daha önce paylaşılmış gizli anahtarı Zoom tarafında yenileyin ve yeni değeri yalnızca Render'ın gizli ortam ayarına yazın. Meeting SDK uygulaması ve ilgili toplantı için gerçek bağlantı testi gereklidir. Bu entegrasyon henüz gerçek toplantıyla doğrulanmadı.

Amaç: üyelerin Zoom hesabı açmadan site içinden izlemesi. Toplantının kimliği doğrulanmış kullanıcı şartı, bekleme odası ve katılım ayarlarını bu akışla test edin. Mevcut SDK entegrasyonu katılımcı rolü kullanır; yalnızca izleme davranışı için toplantı sahibi mikrofon, kamera, ekran paylaşımı ve Zoom sohbet izinlerini de düzenlemelidir. Sitenin soru paneli ayrı çalışır.

## 5. Yayın öncesi kabul kontrolü

- Yönetici girişi, üyelik başvurusu, onay, yönetici yetkisi verme ve şifre değiştirme.
- Sohbet, video, fotoğraf ve ses yükleme; yeniden dağıtımdan sonra içeriklerin korunması.
- Vurgulamalar, sohbet sırasına göre notlar ve numaralı Word dışa aktarımı.
- Gerçek Zoom toplantısında masaüstü, mobil ve tablet üzerinden görüntü, ses, tam ekran ve çıkış.
- Soru gönderme, yöneticinin düzenlemesi, onay ve izleyici listesi.
- Yedekten geri yükleme denemesi.

## 6. Üretim hazırlığında kalan teknik işler

`server/README.md` mevcut sunucuyu yerel kullanım odaklı olarak tanımlar. Genel kullanıma açılmadan önce üretime uygun sunucu kurulumu, HTTPS arkasında güvenli oturum çerezleri, hatalı giriş/istek sınırlaması, hesap kurtarma ve düzenli yedekleme tamamlanıp doğrulanmalıdır. GitHub'a kod aktarılması bu işlerin tamamlandığı anlamına gelmez.
