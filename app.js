const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();   

app.set('view engine', 'ejs');   
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("CSS"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true}); 
const itemsSchema ={
    name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1= new Item({
    name:"heyy"
});
const item2= new Item({
    name:"heyy heyy"
});
const item3= new Item({
    name:"heyy heyy heyy"
});

const defaultItems = [item1, item2, item3];


app.get("/", function(req,res){
    Item.find({}, function(err, foundItems){
        if (foundItems.length === 0){  // to only add one time in data base
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("sucessfully saved default items to database");
                }
            });   
            res.redirect("/");
        }else{
        res.render("list", { newlistitem: Item});  // list is the ejs file name which has to exist inside views folder beacuse ejs automatically looks insidw views folder
        }
    });    
});

app.post("/", function(req,res){

    const itemName = req.body.newItem;
    const item = new item({
        name: itemName
    })
    item.save();

    res.redirect("/");

});


app.listen(8000, function(){
    console.log("SERVER IS RUNNING ON PORT 8000");
});