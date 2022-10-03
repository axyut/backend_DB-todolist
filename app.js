const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();   

app.set('view engine', 'ejs');   
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true}); 

const itemsSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});
const List = mongoose.model("List", listSchema);

const item1= new Item({
    name:"Manage your tasks."
});

const item2= new Item({
    name:"Check to complete your task."
});

const defaultItems = [item1, item2];

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
        res.render("list", {listTitle: "Today", newListItems: foundItems});  // list is the ejs file name which has to exist inside views folder beacuse ejs automatically looks insidw views folder
        }
    });    
});

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if (!err) {
            if(!foundList){  // Create a new list
                const list = new List ({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }else{          // Use Existing List
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    })
})

app.post("/", function(req,res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    })
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("Sucessfully deleted checked item.");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }
})

app.listen(8000, function(){
    console.log("SERVER IS RUNNING ON PORT 8000");
});