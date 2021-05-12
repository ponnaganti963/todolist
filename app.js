//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));


mongoose.connect("mongodb+srv://ponnaganti_963:Manikanta9631@cluster0.jqjbu.mongodb.net/toDoListdb",{ useNewUrlParser: true,useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = {
  name: String
};


const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your TO-DO List."
});

const item2 = new Item({
  name: "Hit + to add new item."
});
const item3 = new Item({
  name: "Check the box to delete item."
});

const defaultitems = [item1, item2, item3];

const listSchema ={
  name: {
    type: String,
    unique: true
  },
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res){
  Item.find({},function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultitems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("added");
        }
      });
      res.redirect("/");
    }
    else{
      let lists = [];
      List.find({},function(err, foundlists){
        foundlists.forEach(function(found){
          lists.push(found.name);
        })
        lists = [...new Set(lists)];
        console.log(lists);
        res.render("list", {toDoDate: "Today",items: foundItems,lists: lists});
      })

    }
  });
});


app.post("/new",function(req, res){
  const newList = req.body.newlist;
  res.redirect("/" + newList);
})

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name: customListName,
          items: defaultitems
        });
        list.save();
        res.redirect("/"+ customListName);
      }else{
        let lists = [];
        List.find({},function(err, foundlists){
          foundlists.forEach(function(found){
            lists.push(found.name);
          })
          lists = [...new Set(lists)];
          console.log(lists);
          res.render("list", {toDoDate: foundlist.name,items: foundlist.items,lists:lists});
        })


      }
    }
  });

});

app.post("/", function(req, res){
  let itemname = req.body.newItem;
  let listname = req.body.list;
    const newItem = new Item({name : itemname});
if(itemname){
    if(listname === "Today"){
      newItem.save();
      // listitems.push(item);
      res.redirect("/");
    }else{
      List.findOne({name: listname}, function(err,foundlist){
        foundlist.items.push(newItem);
        foundlist.save();
        res.redirect("/"+ listname);
      });
    }
  }else{
    if(listname === "Today"){
      res.redirect("/")
    }else{
      res.redirect("/" + listname);
    }
  }


});

app.post("/deletelist", function(req, res){
  const listname = req.body.button;
  console.log(listname);
  List.deleteMany({name: listname}, function(err){
    if(!err){
      console.log("Successfully deleted!");
      res.redirect("/");
    }
  })
})

app.post("/delete", function(req,res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully Deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}} , function(err){
      if(!err){
        console.log("Successfully Deleted");
        res.redirect("/" + listName);
      }
    })
  }

});

app.listen(3000, function(req, res){
  console.log("working uder server 3000");
})
