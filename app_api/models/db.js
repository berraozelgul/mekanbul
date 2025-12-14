var mongoose=require("mongoose");
var dbURI = process.env.MONGODB_URI;
//const dbURI = "mongodb://localhost:27017/mekanbul";
mongoose.connect(dbURI);
mongoose.connection.on("connected",function(){
    console.log("Mongoose "+dbURI+" adresindeki veritabanına bağlandı.");
});
mongoose.connection.on("error",function(){
    console.log("Mongoose bağlantı hatası.");
});
mongoose.connection.on("disconnected",function(){
    console.log("Mongoose bağlantısı kesildi.");
});
process.on("SIGINT",function(){
    mongoose.connection.close();
    console.log("Mongoose uygulama sonlandırma nedeniyle bağlantıyı kapattı.");
    process.exit(0);
});
require("./venue");