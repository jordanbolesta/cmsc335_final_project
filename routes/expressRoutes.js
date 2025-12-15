const express = require("express");
const router = express.Router();

// require funcs:
const { insertSearch, getSummary, getUMDResources, countTopic } = require("../funcs.js");

// render displayResouces page with router:
router.post("/displayResources", async (request, response) => { 
	
    let chosenTopics = request.body.topics;
    let timestamp = new Date();
    let comments = request.body.comments || "";

    // make sure its an array:
    if (!Array.isArray(chosenTopics)) {

        if (chosenTopics) {
            chosenTopics = [chosenTopics];
        } else {
            chosenTopics = []
        }
    }

	// call insertChosenTopics func:
	insertSearch(chosenTopics, timestamp, comments);

    // make all dispaly tables:
    let displayTables = "";


	// build table for each topic
    // (i want each displayed topic ot get its own table)
    for (const topic of chosenTopics) {

        let summary = await getSummary(topic);
        let resources = getUMDResources(topic);

        let resourcesList = `<ul>`;
        for (let i = 0; i < resources.length; i++) {
            resourcesList += `<li><a href="${resources[i].url}" target="_blank"> ${resources[i].name}</a></li>`;
        }

        resourcesList += `</ul>`;
        
		displayTables +=  `<table class="tablez" border="1">
                                <thead><tr>
                                    <th width="150"> Topic </th>
                                    <th width="800"> Summary </th>
                                    <th width="300"> Resources </th>
                                </tr></thead>

                                <tbody><tr> 
                                    <td> ${topic} </td>
                                    <td> ${summary} </td>
                                    <td> ${resourcesList} </td>
						        </tr></tbody>
                            </table><br>`;

	}

    // set variables:
	const variables = {

		topics : chosenTopics,
		timestamp : timestamp,
        table : displayTables
	};


    response.render("displayResources", variables);
});


// display review searches page with router
router.post("/reviewSearches", async (request, response) => { 

	// make display table
    let displayTable = `<table class="tablez" border="1">
                            <thead><tr>
                                <th width="150"> Topic </th>
                                <th width="150"> Number of Searches </th>
                            </tr></thead>
                        <tbody>`;

    let topicArray = ["ADHD", "Mental Health", "Chronic Illness",
        "Counseling", "Disability"];

    for (let i = 0; i < topicArray.length; i++) {

        const total = await countTopic(topicArray[i]);

        displayTable += `<tr> 
                            <td> ${topicArray[i]} </td>
                            <td> ${total} </td>
                        </tr>`;
    }

    displayTable += `</tbody></table><br>`;

 
     // set variables:
     const variables = {
 
         table : displayTable
     };

	response.render("showSearches", variables);


});

// export the router!!
module.exports = router;
