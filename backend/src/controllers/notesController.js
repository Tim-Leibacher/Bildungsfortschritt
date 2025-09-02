import Note from "../models/Note.js";

export const getAllNotes = async (_, res) => {
    try{
        const notes = await Note.find().sort({ createdAt: -1 });
        res.status(200).json(notes);
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Error in getAllNotes", err });
    }
}

export const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findById(id);
        if (!note) return res.status(404).json({ message: "Note not found" });
        res.status(200).json(note);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error in getNoteById", err });
    }
};

export const createNote = async (req, res) => {
    try {
        const {title, content} = req.body;
        const newNote = new Note({title,content});
        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error in createNote", err });
    }
}

export const updateNote = async (req, res) => {
    try {
        const {title, content} = req.body
        const updatedNote = await Note.findByIdAndUpdate(req.params.id, {title, content}, { new: true });
        if (!updatedNote) return res.status(404).json({ message: "Note not found" });
        res.status(200).json(updatedNote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error in updateNote", error });
    }
}

export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNote = await Note.findByIdAndDelete(id);
        if (!deletedNote) return res.status(404).json({ message: "Note not found" });
        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error in deleteNote", error });
    }
}
