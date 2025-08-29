import fs from 'fs';
import imagekit from '../configs/imagekit.js';
import Story from '../models/story.js';
import User from '../models/user.js';
import { inngest } from '../inngest/index.js';

//Add user story
export const addUserStory = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { content, background_color } = req.body;
        const mediaFiles = req.files; // multiple files
        let createdStories = [];

        if (mediaFiles && mediaFiles.length > 0) {
            for (let file of mediaFiles) {
                const fileBuffer = fs.readFileSync(file.path);
                const response = await imagekit.upload({
                    file: fileBuffer,
                    fileName: file.originalname,
                });

                const media_type = file.mimetype.startsWith("video") ? "video" : "image";

                const story = await Story.create({
                    user: userId,
                    content,
                    media_url: response.url,
                    media_type,
                    background_color
                });

                // schedule deletion after 24h
                await inngest.send({
                    name: "app/story.delete",
                    data: { storyId: story._id }
                });

                createdStories.push(story);
            }
        } else {
            // case for text-only story
            const story = await Story.create({
                user: userId,
                content,
                media_type: "text",
                background_color
            });

            await inngest.send({
                name: "app/story.delete",
                data: { storyId: story._id }
            });

            createdStories.push(story);
        }

        res.json({ success: true, stories: createdStories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


//Get user stories
export const getStories = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    const userIds = [userId, ...user.connections, ...user.following];

    const expiryTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stories = await Story.find({
      user: { $in: userIds },
      createdAt: { $gte: expiryTime }
    })
      .populate("user")
      .sort({ createdAt: -1 });

    // group by user
    const grouped = {};
    stories.forEach((story) => {
      const uid = story.user._id.toString();
      if (!grouped[uid]) {
        grouped[uid] = {
          user: story.user,
          latestAt: story.createdAt, // track latest story timestamp
          stories: []
        };
      }
      grouped[uid].stories.push(story);
    });

    // sort stories inside each user (oldest → newest)
    Object.values(grouped).forEach((g) => {
      g.stories.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });

    // sort users by their latest story (newest → oldest)
    const result = Object.values(grouped).sort(
      (a, b) => new Date(b.latestAt) - new Date(a.latestAt)
    );

    res.json({ success: true, stories: result });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

