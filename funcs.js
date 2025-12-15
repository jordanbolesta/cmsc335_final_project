const path = require("path");
require("dotenv").config({
   path: path.resolve(__dirname, ".env"),
});

// use mongoose to interact with MongoDB
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_CONNECTION_STRING)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// define schema
const topicSchema = new mongoose.Schema({
    topic: String,
    submittedBy: String,
    comments: String,
    timestamp: { type: Date, default: Date.now },
 });

//  create model
const Topic = mongoose.model("Topic", topicSchema);


// save count for anonymous users
let userCount = 1;

// insert search into the database
// (store data to MongoDB)
async function insertSearch(topics, timestamp, comments) {

   try {

         // make sure its an array:
        if (!Array.isArray(topics)) {

            if (topics) {
                topics = [topics];
            } else {
                topics = []
            }
        }

        // if comments = "", enter "None"
        if (!comments || comments.trim() === "") {
            comments = "None";
        }

        // loop through topics:
        for (const topic of topics) {
            const anonymousUser = `anonymousUser${userCount++}`;

            const newTopic = new Topic({
                topic : topic,
                submittedBy: anonymousUser,
                comments: comments,
                timestamp : timestamp
            });

            await newTopic.save();
        }

    } catch (e) {
      console.error(e);
    } 
}



// get summary of condition
// use wikipedia API!!
async function getSummary(topic) {

    let correctTopic;

    // map sleected topics to wikepedia page titles:
    if (topic == "ADHD") {
        correctTopic = "Attention_deficit_hyperactivity_disorder";

    }
    if (topic == "Mental Health") {
        correctTopic = "Mental_health";

    }
    if (topic == "Chronic Illness") {
        correctTopic = "Chronic_condition";

    }
    if (topic == "Counseling") {
        correctTopic = "Clinical_mental_health_counseling";

    }
    if (topic == "Disability") {
        correctTopic = "Disability";
    }

    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${correctTopic}`;

      try {

        let response = await fetch(url, {
            headers: {
                "User-Agent": "UMD CMSC335 Final Project (bolestaj@terpmail.umd.edu)"
            }
        });

        // kept getting stuck!!
        if (response.status === 429) {
            console.log("error, trying again in one second");
            await new Promise(response => setTimeout(response, 1000));

            // try again:
            return getSummary(topic);
        }

        // debug!:
        if (!response.ok) {
            console.error("HTTP status: ", response.status);
            console.error(`Error fetching summary for ${topic}`);
            return "No summary available";
        }

      const data = await response.json();
      return data.extract_html || "No summary available";

        } catch (e) {
        console.error(e);
        return "Error fetching summary"
        } 
}

// displlay topic resources
function getUMDResources(topic) {

    const resources = {

        "ADHD": [
            { name: "UMD Main ADHD Page", url: "https://counseling.umd.edu/resources/students/attention-deficit-hyperactivity-disorder" }, 
            { name: "University Health Center", url: "https://health.umd.edu/" }, 
            { name: "Counseling Center", url: "https://counseling.umd.edu/clinical-services/individual-counseling" }, 
            { name: "Accessibilty and Disability Service", url: "https://ads.umd.edu/" }
        ],

        "Mental Health": [
            { name: "UMD Main Mental Health Page", url: "https://mentalhealth.umd.edu/#resources" }, 
            { name: "Counseling Center", url: "https://counseling.umd.edu/clinical-services/individual-counseling" }, 
            { name: "Campus Intiatives", url: "https://mentalhealth.umd.edu/#initiatives" }, 
            { name: "Campus Events", url: "https://mentalhealth.umd.edu/#events" }, 
            { name: "Accessibilty and Disability Service", url: "https://ads.umd.edu/" }, 
            { name: "Additional Mental Health Resources", url: "https://counseling.umd.edu/resources" }
        ],

        "Chronic Illness": [
            { name: "Student Health Center", url: "https://health.umd.edu/" },
            { name: "Accessibilty and Disability Service", url: "https://ads.umd.edu/" }, 
            { name: "Additional Mental Health Resources", url: "https://counseling.umd.edu/resources" }
        ],

        "Counseling": [
            { name: "Counseling Center", url: "https://counseling.umd.edu/clinical-services/individual-counseling" }, 
            { name: "Accessibilty and Disability Service", url: "https://ads.umd.edu/" }, 
            { name: "Additional Mental Health Resources", url: "https://counseling.umd.edu/resources" }
        ],

        "Disability": [
            { name: "Accessibilty and Disability Service", url: "https://ads.umd.edu/" }
        ]

    };

    return resources[topic] || [];
    

};

// count topics inserted, aka number of searched per topic!
// (get data from MongoDB)
async function countTopic(topic) {
    return await Topic.countDocuments({topic});
}

module.exports = { insertSearch, getSummary, getUMDResources, countTopic};

