import asyncHandler from "express-async-handler";
import Module from "../models/moduleModel.js";

export const createModule = asyncHandler(async(req,res)=>{
    const {title, description, isPublic, slides} = req.body;

    const module = await Module.create({
        title,
        description,
        isPublic,
        slides,
        educator: req.user._id
    });

    res.status(201).json(module);
});

export const getPublicModules = asyncHandler(async(req,res)=>{
    const modules = await Module.find({isPublic: true}).sort({createdAt: -1}).populate('educator','name');

    res.status(200).json(modules);
})

export const getModuleById = asyncHandler(async(req,res)=>{
    const module = await Module.findById(req.params.id).populate('educator', 'name');

    if(module){
        res.status(200).json(module);
    }
    else{
        res.status(404);
        throw new Error("Module not found");
    }
})

export const updateModule = asyncHandler(async(req,res)=>{
    const module = await Module.findById(req.params.id);

    if(!module){
        res.status(404);
        throw new Error('Module not found');
    }

    if(module.educator.toString() !== req.user.id){
        res.status(401);
        throw new Error('User not authorized to update this module');
    }

    const updatedModule = await Module.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json(updatedModule);
});

export const deleteModule = asyncHandler(async(req,res)=>{
    const module = await Module.findById(req.params.id);

    if(!module){
        res.status(404);
        throw new Error('Module not found');
    }

    if(module.educator.toString() !== req.user.id){
        res.status(401);
        throw new Error('User not authorized to update this module');
    }

    await module.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Module deleted successfully' });
})