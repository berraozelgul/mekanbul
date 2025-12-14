Vercel Linkim=> https://mekanbul-lpaz.vercel.app/

 Mekan (Venue) İşlemleri

GET /api/venues
➜ Tüm mekanları listeler

POST /api/venues
➜ Yeni bir mekan ekler

GET /api/venues/:venueid
➜ Belirtilen mekanın detaylarını getirir

PUT /api/venues/:venueid
➜ Belirtilen mekanı günceller

DELETE /api/venues/:venueid
➜ Belirtilen mekanı siler

 Yorum (Comment) İşlemleri

POST /api/venues/:venueid/comments
➜ Belirtilen mekana yeni yorum ekler

GET /api/venues/:venueid/comments/:commentid
➜ Belirtilen yorumu getirir

PUT /api/venues/:venueid/comments/:commentid
➜ Belirtilen yorumu günceller

Mekan(Venue) Tesleri  
Mekan Ekleme (POST /api/venues)
![Mekan Ekle](test/addVenue.png)

Mekanları Listeleme (GET /api/venues)
![Mekan Listele](test/listnearbyVenues.png)

Mekan Detayı (GET /api/venues/:venueid)
![Mekan Detay](test/getVenue.png)

Mekan Güncelleme (PUT /api/venues/:venueid)
![Mekan Güncelle](test/updateVenue.png)

Mekan Silme (DELETE /api/venues/:venueid)
![Mekan Sil](test/deleteVenue.png)

Yorum(Comment) Testleri
Yorum Ekleme (POST /api/venues/:venueid/comments)
![Yorum Ekle](test/addComment.png)

Yorum Getirme (GET /api/venues/:venueid/comments/:commentid)
![Yorum Getir](test/getComment.png)

Yorum Güncelleme (PUT /api/venues/:venueid/comments/:commentid)
![Yorum Güncelle](test/updateComment.png)

Yorum Silme (DELETE /api/venues/:venueid/comments/:commentid)
![Yorum Sil](test/deleteComment.png)



DELETE /api/venues/:venueid/comments/:commentid
➜ Belirtilen yorumu siler
