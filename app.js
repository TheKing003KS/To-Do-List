// Importing all the necessary dependencies
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

// Starting express.js app
const app = express();

// Setting up ejs
app.set('view engine', 'ejs');

// Setting up body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Setting up connection to the MongoDB server
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

// Creating the collections schema & model
const taskschema = {name: String};
const task = mongoose.model("task",taskschema);

const task1 = new task({
  	name: "Welcome to your To-Do List!!"
});

const task2 = new task({
  	name: "Hit + to create a new task."
});

const task3 = new task({
	name: "<-- Click this to delete a task."
});

const defaultTasks = [task1,task2,task3];

const listSchema = {name: String, items: [taskschema]};
const list = mongoose.model("list",listSchema);

app.get("/", function(req, res) {

  	task.find(function(err,result){
		  if(err) {console.log(err);}
		  else {
				//console.log(result);

				if(result.length === 0){
					
					task.insertMany(defaultTasks, function(err){
						if(err) {console.log(err);}
						else {console.log("Successfully Added the Default Tasks to the DB.");}
				  });

				  res.redirect("/");
				}
				else {res.render("list", {listTitle: "Today", newListItems: result});}
			}
	  });
});

app.get("/:customListName", function(req,res){

	const customListName = lodash.capitalize(req.params.customListName);

	list.findOne({name: customListName}, function(err,result){
		
		if(err) {console.log(err);}
		else {
			if(!result){
				console.log("Successfully created new list.");

				const newTask = new list({
					name: customListName,
					items: defaultTasks
				});
				newTask.save();

				res.redirect("/" + customListName);
			}
			else{
				console.log("List already exists in the database.");
				res.render("list", {listTitle: customListName, newListItems: result.items});
			}
		}
	});	
});

app.post("/", function(req, res){

    const taskName = req.body.newItem;
	const listName = req.body.list;

	const newTask = new task({
		name: taskName
	});

	if(listName === "Today"){
		console.log("Adding into the default list.");
		
		newTask.save();
		res.redirect("/");
	}
	else{
		list.findOne({name: listName}, function(err,result){

			if(err) {console.log(err);}
			else{
				console.log("Adding into the custom list.");

				result.items.push(newTask);
				result.save();

				res.redirect("/" + listName);
			}
		});
	}
});

app.post("/delete", function(req,res){

	const taskid = req.body.deleteItem;
	const listName = req.body.listName;

	if(listName === "Today"){
		
		task.findByIdAndRemove(taskid, function(err){
			console.log("Deleting from the default list.");
			
			if(err) {console.log(err);}
			else {res.redirect("/");}
		})
	}
	else{
		list.findOneAndUpdate({name: listName}, {$pull: {items: {_id: taskid}}}, function(err, result){

			if(err) {console.log(err);}
			else{
				console.log("Deleting from the custom list.");

				res.redirect("/" + listName);
			}
		});
	}
});

app.get("/about", function(req, res){
  	res.render("about");
});

app.listen(3000, function() {
  	console.log("Server started on port 3000");
});
