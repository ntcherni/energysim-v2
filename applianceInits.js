const appliance_inits = [
	{
		type : 'fridge',
		watts1 : 200,
		watts2 : 190, 
		min: false,
		max: false,
		motive: 'hunger',
		alwaysOn: true,
	},
	{
		type : 'microwave',
		watts1 : 1000,
		watts2 : 5,
		min: 1,
		max: 5,
		motive: 'hunger',
	},
	{
		type : 'oven',
		watts1 : 2000,
		watts2 : 2000,
		min: 10,
		max: 60,
		motive: 'hunger',
	},
	{
		type : 'stove',
		watts1 : 1250,
		watts2 : 1250,
		min: 10,
		max: 60,
		motive: 'hunger',
	},
	{
		type : 'toaster',
		watts1 : 1400,
		watts2 : 1400,
		min: 1,
		max: 5,
		motive: 'hunger',
	},
	{
		type : 'kettle',
		watts1 : 1500,
		watts2 : 1500,
		min: 5,
		max: 10,
		motive: 'hunger',
	},
	{
		type : 'coffeemaker',
		watts1 : 900,
		watts2 : 900,
		min: 5,
		max: 10,
		motive: 'hunger',
	},
	{
		type : 'dishwasher',
		watts1 : 1500,
		watts2 : 200,
		min: 30,
		max: 120,
		motive: 'cleanliness:dishes'
	},
	{
		type : 'exhaust',
		watts1 : 260,
		watts2 : 260,
		min: false,
		max: false,
	},
	{
		type : 'light',
		watts1 : 100,
		watts2 : 100,
		min: 1,
		max: 1440,
	},
	{
		type : 'tv',
		watts1 : 270,
		watts2 : 5,
		min: 15,
		max: 360,
		motive: 'entertainment'
	},
	{
		type : 'xbox',
		watts1 : 185,
		watts2 : 5,
		min: 15,
		max: 360,
		motive: 'entertainment'
	},	
	{
		type : 'dvd',
		watts1 : 35,
		watts2 : 5,
		min: 15,
		max: 360,
		motive: 'entertainment'
	},	
	{
		type : 'fan',
		watts1 : 75,
		watts2 : 75,
		min: 5,
		max: 360,
		motive: 'comfort:temperature'
	},	
	{
		type : 'computer',
		watts1 : 200,
		watts2 : 5,
		min: 30,
		max: 360,
		motive: 'entertainment'
	},	
	{
		type : 'plug',
		watts1 : 5,
		watts2 : 5,
		min: 10,
		max: 360,
		motive: 'other'
	},
	{
		type : 'washingmachine',
		watts1 : 1900,
		watts2 : 300,
		min: 60,
		max: 120,
		motive: 'cleanliness:clothes'
	},
	{
		type : 'dryer',
		watts1 : 4800,
		watts2 : 4800,
		min: 60,
		max: 120,
		motive: 'cleanliness:clothes'
	},		
	{
		type : 'airconditioner',
		watts1 : 3500,
		watts2 : 3450,
		min: false,
		max: false,
		motive: 'comfort:temperature'
	},
	{
		type : 'furnace',
		watts1 : 10000,
		watts2 : 9950,
		min: false,
		max: false,
		motive: 'comfort:temperature'
	},
	{
		type : 'hairdryer',
		watts1 : 1000,
		watts2 : 1000,
		min: 5,
		max: 10,
		motive: 'aesthetics'
	},
	{
		type : 'bath',
		watts1 : 3800,
		watts2 : 1900,
		min: 30,
		max: 60,
		motive: 'hygiene'
	},
	{
		type : 'shower',
		watts1 : 1000,
		watts2 : 1000,
		min: 5,
		max: 15,
		motive: 'hygiene'
	},						
];

module.exports = appliance_inits;