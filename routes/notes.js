const express = require('express')
var fetchuser = require('../middleware/fetchuser')
const { validationResult, body } = require('express-validator');
const Notes = require('../models/Notes')


const router = express.Router()

// ROUTE 1: Fetch All Notes using GET at path "/api/notes/fetchAllNotes". Login Required.
router.get('/fetchAllNotes', fetchuser, async (req,res)=>{
    try {
        if(req.user){
            const notes = await Notes.find({user: req.user.id})
            res.json(notes);
        }
        else{
            res.send()
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error!")
    }
    
})

// ROUTE 2: Add Note using POST at path "/api/notes/addNote". Login Required.
router.post('/addNote', fetchuser, [
    body('title','Enter a valid title').isLength({min:3}),
    body('description','Description should include atleast 5 characters').isLength({min:5})
], async (req,res)=>{
    try {
        // if correct user
        // if(req.user){
        //     const notes = await Notes.find({user: req.user.id})
        //     res.json(notes);
        // }
        // else{
        //     res.send()
        // }
        //get errors from validations written above
        const errors = validationResult(req);
        //if there exist errors, return result with statuscode 400 and error array where each element is error of every failed validation
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
        //extract note details from request body
        const {title, description, tag} = req.body;
        //create new note
        const note = new Notes({
            title, description, tag, user:req.user.id
        })
        //save the note in DB
        const savedNote = await note.save()
        //return saved note as response
        res.json(savedNote)
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error!")
    }
    
})

// ROUTE 3: Update existing Note using PUT at path "/api/notes/updateNote". Login Required.
router.put('/updateNote/:id', fetchuser, async (req,res)=>{
    try {
        const {title, description, tag} = req.body;
        //create updatedNote object
        const updatedNote = {};
        if(title){updatedNote.title = title};
        if(description){updatedNote.description = description}
        if(tag){updatedNote.tag = tag}
        //Find note
        let note = await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Note Not Found!")}
        //Confirm the note is of the right user
        if(note.user.toString()!==req.user.id){
            return res.status(401).send("UNAUTHORIZED");
        }
        //update the note
        note = await Notes.findByIdAndUpdate(req.params.id,{$set: updatedNote},{new:true})
        res.json(note)
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error!")
    }
})

// ROUTE 4: Delete existing Note using DELETE at path "/api/notes/deleteNote". Login Required.
router.delete('/deleteNote/:id', fetchuser, async (req,res)=>{
    try {
        const {title, description, tag} = req.body;
        //Find note
        let note = await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Note Not Found!")}
        //Confirm the note is of the right user
        if(note.user.toString()!==req.user.id){
            return res.status(401).send("UNAUTHORIZED");
        }
        //update the note
        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({statusMessage:"Success, Note has been deleted!"})
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error!")
    }
})

module.exports = router;