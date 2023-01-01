const express=require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs')
const _=require('lodash');
const mongoose=require('mongoose');
mongoose.set("strictQuery", false);
const uri="mongodb://localhost:27017/To-do-listdb"
const onlineUri="mongodb+srv://anonymous-chief:test123@cluster0.sx8cqrv.mongodb.net/To-do-listdb"

mongoose.connect(onlineUri,function(err){
    if(!err){
        console.log("Server is connected to backend")
    }
    else{
        console.log(err);
    }
    
});

const listSchema=mongoose.Schema({
    name:String
})

const wishListSchema=mongoose.Schema({
    name:String,
    content:[listSchema],
})

const List=mongoose.model("List",listSchema)
const WishList=mongoose.model("WishList",wishListSchema)

const app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

const defaultList=[{name:"Welcome to Your to Do list"},{name:"Write Your task Below and click + "},{name:"<-- click to Delete"}]
let added =0;
app.get("/",function(req,res){
    let date= new Date();
    date=date.toLocaleString("en-us",{year:"numeric",weekday:"long",month:"short",day:"numeric"})
    List.find(function(err,toDoData){
        if(err){
            console.log(err)
        }
        else{
            
                res.render("lists",{heading:date, toDoList:toDoData})
            
        }
    })

    
})

app.post('/',function(req,res){
    let newEvent=req.body.newlistitem
    const listItem= new List({
        name:newEvent
    })
    listItem.save();
    res.redirect('/')
})

app.post('/delete',function(req,res){
    let itemId=req.body.itemId
    List.deleteOne({_id:itemId},function(err){
        if(err){
            console.log(err);
        }
        else{
            res.redirect('/');
        }
    })
})

app.get('/:wishlist',function(req,res){
    let wishListHeading=_.capitalize(req.params.wishlist)
    WishList.findOne({name:wishListHeading},function(err,result){
        if(err){
            console.log(err)
        }
        else{
            if(result){
                res.render('wishlist',{heading:wishListHeading,toDoList:result.content})
            }
            else{
                const wishList= new WishList({
                    name:wishListHeading,
                    content:[]
                })
                wishList.save();
                res.redirect('/'+wishListHeading)

            }
        }
    })
})

app.post('/:wishlist',function(req,res){
    let wishListHeading=_.capitalize(req.params.wishlist)
    let newEvent=req.body.newlistitem;
    WishList.findOne({name:wishListHeading},function(err,result){
        result.content.push({
            name:newEvent
        })
        result.save();
        res.redirect('/'+wishListHeading)
    })
})

app.post('/:wishlist/delete',function(req,res){
    let itemId=req.body.itemid
    let wishListHeading=_.capitalize(req.params.wishlist)
    WishList.findOneAndUpdate({name:wishListHeading},{ $pull:{content:{_id:itemId}} }, function(err, data){
        if(err){
            console.log(err)
        }
        else{
           res.redirect('/'+wishListHeading)
        }
    } )
})


app.listen(process.env.PORT || 3000,function(req,res){
    console.log("Server is running at the port 3000");
})