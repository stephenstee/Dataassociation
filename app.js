var express = require("express");
var app = express();
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var bodyParser = require("body-parser");
var User = require("./models/user");
mongoose.connect("mongodb://localhost/association",{useNewUrlParser:true, useUnifiedTopology:true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
	secret: "i am the legend",
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var studentSchema = new mongoose.Schema({
	name: String,
	dob: String,
	author: {
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
})
var Student = mongoose.model("Student", studentSchema);

/////////////////////////////////////////////////////////////////////
// Student.create({
// 	name: "franklin",
// 	dob: "12051999"
// },function(err,student){
// 	if(err){
// 		console.log("error");
// 	}else{
// 		console.log(student);
		
// 	}
// })

// User.create({
// 	username:"frank",
// 	password:"123"
// },function(err,user){
// 	if(err){
// 		console.log("error");
// 	}else{
// 		console.log(user);
// 		Student.findOne({name:"franklin"},function(err,student){
// 			if(err){
// 				console.log(err);
// 			}else{
// 				student.author.id = user;
// 				student.author.username = user.username;
// 				student.save(function(err,data){
// 					if(err){
// 						console.log(err);
// 					}else{
// 						console.log(data);
// 						console.log(data.author.id);
// 						console.log(data.author.username);
// 							console.log("answer " + data.author.username === user.username);
// 					}
// 				})
// 			}
// 		})
// 	}
// })
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next()
})


//////////////////////////////////////////////////////////////////////////////////////
app.get("/",function(req,res){
	res.redirect("/register");
})

app.get("/home",isLoggedIn,function(req,res){
res.render("home");	
})


app.get("/student",isLoggedIn,function(req,res){
	Student.find({},function(err, student){
		if(err){
			console.log(err);
		}else{
	       res.render("studentdetails", {student:student});		
		}
	})
	
})

app.get("/student/new",isLoggedIn,function(req,res){
	res.render("studentform");
})


app.post("/student",isLoggedIn,function(req,res){
	var name = req.body.name;
	var dob = req.body.dob;
var author = {
	id: req.user._id, 
	username: req.user.username
}
var newstudent = {
	name:name,
	dob: dob,
	author: author
}

	Student.create(newstudent,function(err,student){
		if(err){
			console.log(err);
		}else{
			console.log("This is student details"+ student)
			// if(student.author.id.equals(req.user._id))
				{
					console.log("okok done");
				}
			res.redirect("/home")
		}
	})
})


app.get("/student/:id",CheckOwner,function(req,res){
	Student.findById(req.params.id,function(err, student){
		if(err){
			res.redirect("/home");
		}else{
			res.render("show", {student: student});
		}
	})
})


//////////////////////////////////////////////////////////////////////////////////
// authentication


app.get("/register",function(req,res){
	res.render("register");
});

app.post("/register",function(req,res){
	User.register(new User({username: req.body.username}), req.body.password, function(err,user){
		if(err){
			console.log("error");
			return res.render("/register");
		}
		passport.authenticate("local")(req,res, function(){
			res.redirect("/student/new");
	})
})
})

app.get("/login",function(req,res){
	res.render("login");
})

app.post("/login",passport.authenticate("local",{
	successRedirect: "/home",
	failureRedirect: "/login"
	
}),function(req,res){	
});

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/login");
})


function isLoggedIn(req,res, next){
	if(req.isAuthenticated()){
		return next();	
	}
	res.redirect("/login");
	
}
function CheckOwner(req,res,next){
	if(req.isAuthenticated()){
		Student.findById(req.params.id,function(err,student){
			if(err){
				console.log(err);
			}else{
				if(student.author.id.equals(req.user._id)){
					next();
			   }
			else
			{
			res.redirect("back");	
			}
			}
		})
	}else{
		res.redirect("back");
	}
}




app.listen(3000,function(){
	console.log("server starts");
})
