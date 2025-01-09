import mongoose from "mongoose";

// Import all models
import "./User";
import "./Group";
import "./Message";

// Export models
export const User = mongoose.models.User;
export const Group = mongoose.models.Group;
export const Message = mongoose.models.Message;
