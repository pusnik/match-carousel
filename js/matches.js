/*
 *  jQuery Match-Carousel v1.0.0
 *
 *  Copyright (c) 2015 Grega Pušnik
 *  
 *  Usage: $("element").matchCarousel({maxMatches:20, sports:["Soccer","Basketball"], URL:"url-of-json"});
 *  Allowed sports: Soccer, Basketball, Ice Hockey, Tennis, Handball, Floorball, Bandy, Snooker, Volleyball
 */

(function( $ ) {	
	/* Sport->Categories->Tournaments->Matches */
	
	/*
	 *------------------------
	 *	START CAROUSEL CLASSES
	 *------------------------
	 *
	*/
	
	/**
	*	Sport object
	*	@constructor
	*	@param {String} _name
 	* 	
	*/
	function Sport(_name) {
		this.name = _name;
		this.categories = [];
	}
	
	/**
	*	Sport categories setter
	*	@param {Array} _categories
	*/
	Sport.prototype.setCategories = function (_categories) {
		this.categories = _categories;
	}

	/**
	*	Category object
	*   @constructor
	*	@param {String} _name
	*/
	function Category(_name) {
		this.name = _name;
		this.tournaments = [];
	}
	
	/**
	*	Category tournaments setter
	*	@param {Array} _tournaments
	*/
	Category.prototype.setTournaments = function (_tournaments) {
		this.tournaments = _tournaments;
	}
	
	/**
	*	Tournament object
	*   @constructor
	*	@param {String} _name
	*	@param {String} _season
	*/
	function Tournament (_name, _season) {
		this.name = _name;
		this.season = _season;
		this.matches = [];
	}
	
	/**
	*	Tournament match setter
	*	@param {Array} _matches
	*/
	Tournament.prototype.setMatches = function (_matches) {
		this.matches = _matches;
	}
	
	/**
	*	Get properly styled Tournament paragraph
	*	@param {Array} _matches
	*/
	Tournament.prototype.getTournamentParagraph = function () {
	
		var tournamentString = this.name;
		
		if(this.season != null)
			tournamentString = tournamentString + " - " +this.season;
			
		var tournamentP = "<p class='text-center title no-bottom-margin'>"+tournamentString+"</p>";
		//if text longer then 45 characters, make font smaller -> quick fix, could be more robustly solved with some jquery plugin
		if(tournamentString.length > 45)
			tournamentP = "<p class='text-center title smaller no-bottom-margin'>"+tournamentString+"</p>";
		return tournamentP;
	}
	
	/**
	*	Team object
	*   @constructor
	*	@param {String} _name
	*	@param {String} _shortName
	*	@param {String} _UID
	*/
	function Team(_name, _shortName, _UID) {
		this.UID = _UID;
		this.name = _name;
		this.shortName = _shortName;
		this.flagURL = "http://ls.betradar.com/ls/crest/big/"+this.UID+".png";
	}
	
	/**
	*	Team flag getter
	*	@return {String} flagURL
	*/
	Team.prototype.getTeamFlagURL = function() {
		return this.flagURL;
	}
	
	/**
	*	Status object
	*	@constructor
	*/
	function Status(_id, _name) {
		this.id = _id;
		this.name = _name;
		this.statusDIVClass = "";
	}
	
	/**
	*	Status div class getter
	*	@return {String} statusDIVClass
	*/
	Status.prototype.getStatusDIVClass = function() {
		return this.statusDIVClass;
	}
	
	/**
	*	Score status div class setter
	*/
	Status.prototype.setStatusDIVClass = function(_className) {
		this.statusDIVClass = _className;
	}
		
	/**
	*	Match object
	*   @constructor
	*	@param {Team}	 	_homeTeam
	*	@param {Team} 		_awayTeam
	*	@param {String} 	_date
	*	@param {String} 	_time
	*	@param {Status} 	_status
	*	@param {Status} 	_homeScore
	*	@param {Status} 	_awayScore
	*	
	*/
	function Match(_homeTeam, _awayTeam, _date, _time, _status, _homeScore, _awayScore) {
		this.homeTeam = _homeTeam;
		this.awayTeam = _awayTeam;
		this.date = _date;
		this.time = _time;
		this.status = _status;
		this.homeScore = _homeScore;
		this.awayScore = _awayScore;
		this.longName = false;		//if either of team names too long, make flag active and set div class to set smaller fonts
		
        if(this.status.id == 100) { //ended match
           	this.status.setStatusDIVClass("post");	
        }
        else if(this.status.id != 0 && this.homeScore != null && this.awayScore != null) {
        	this.status.setStatusDIVClass("live");
        }
        
        if(this.homeTeam.name.length > 12 || this.awayTeam.name.length > 12)
        	this.longName = true;
	}
	
	/**
	*	Match row getter
	*	@return {String} row
	*/
	Match.prototype.getMatchRow = function() {
		if(this.longName)
			return "<div class='row teamTitle smaller'>";
			
		return "<div class='row teamTitle'>";
	}
	
	/**
	*	Score column getter
	*	@return {String} row
	*/
	Match.prototype.getScoreColumn = function() {
		var match_score = "<p class='title no-bottom-margin'>VS</p><p class='title no-bottom-margin'>"+this.time+"</p>"+
            			  "<p class='subtitle text-center date no-bottom-margin'>"+this.date+"</p>";
            						
        if(this.status.statusDIVClass == "live" || this.status.statusDIVClass == "post") {
            match_score = "<p class='score no-bottom-margin'>"+this.homeScore+":"+this.awayScore+"</p>";
        }
	
		return "<div class='col-xs-4 top-margin-10'>"+
            		match_score +
            	"</div>"
	}
	
	/*
	 *------------------------
	 *	END CAROUSEL CLASSES
	 *------------------------
	 *
	*/

	
	/**
	*	Main plugin function
	*	@param  	options	
	*/
    $.fn.matchCarousel = function(options) {
		var defaults = { 
    		maxMatches: 10, 
    		sports: ["Soccer", "Basketball","Ice Hockey","Tennis","Handball","Floorball","Bandy","Snooker","Volleyball"],
    		URL: "http://lsdev.betradar.com/ls/feeds/?/betradar/en/Europe:Berlin/gismo/event_fullfeed/0/5",
   		}; 
   		
   		//check if sport argument is valid
   		if(options.sports) {
   			$.each(options.sports, function(i, sport) {
   				if($.inArray(sport, defaults.sports) == -1){
   					console.log("Sport: "+sport+" not allowed! Using default - all sports");
   					options.sports = defaults.sports;
   				}
   			});
   		}
   		
		options = $.extend(defaults, options); //merge defaults with user options
		
		var sports = [];
		var categories = [];
		var tournaments = [];
		var matches = [];
		var currentMatches = 0;
		
		
		//add loader img
		$(".container").append("<img src='imgs/AjaxLoader.gif' class='loading img-responsive'>");
		
		/* Parse json and save it to objects
		 * Could be done without objects. Would make less code, but also be less customisable and flexible.
		 */
		
		var json = $.getJSON(options.URL, function(data) {
  			$.each(data.doc, function(i, v) {
  				$.each(v.data, function(j, el) {
  					if ($.inArray(el.name, options.sports) != -1) {
  						var aSport = new Sport(el.name);
            			$.each(el.realcategories, function(k, cat) {
            				var aCategory = new Category(cat.name);
            				$.each(cat.tournaments, function(l, tournament) {
            					var aTournament = new Tournament(tournament.name, tournament.seasontypename);
            					$.each(tournament.matches, function(m, match) { 
            						if(currentMatches < options.maxMatches) 
            						{
            							currentMatches++;
            							var currentMatch = new Match (new Team (match.teams.home.name, match.teams.home.abbr, match.teams.home.uid), 
            															new Team (match.teams.away.name, match.teams.away.abbr, match.teams.away.uid), 
            															match._dt.date, match._dt.time, 
            															new Status (match.status._id, match.status.name), 
            															match.result.home, match.result.away);
            							matches.push(currentMatch);
            						}						
            					}); //end of matches	
            					aTournament.setMatches(matches);
            					tournaments.push(aTournament);
            					matches = []; //clear matches array
            				}); //end of tournaments
            				aCategory.setTournaments(tournaments)
            				categories.push(aCategory);
            				tournaments = []; //clear tournaments array;
            			}); // end of categories
            			aSport.setCategories(categories);
            			sports.push(aSport);
            			categories = []; //clear categories array
					}
  			
  				});	//end of data
       		 });	//end of json
		})	//end of parsing
		.fail(function() {
   		 	$(".container").append("JSON PARSING FAILED");
 		 });
		
		/* After json parsing is complete fill the container */
		json.complete(function() {
			$("img.loading").hide(); //hide loading img
			/* Init and setup owl carousel */
			var owl = $(".owl-carousel");
  			owl.owlCarousel({
  					reponsive : false,
  					navigation : true, // Show next and prev buttons
      				slideSpeed : 300,
      				paginationSpeed : 400,
      				singleItem:true});
  			
  			/* Loop through all sports and fill html */
  			$.each(sports, function(i, sport) {
  				$.each(sport.categories, function(j, category) {
  					$.each(category.tournaments, function(k, tournament) {
  						$.each(tournament.matches, function(l, match) {
								owl.data('owlCarousel').addItem("<div class='match-container "+match.status.getStatusDIVClass()+"'>"+
            														"<div class='row'>"+
        																"<div class='col-md-12'>"+
            																tournament.getTournamentParagraph()+
            															"</div>"+
            															"<div class='col-md-8 col-md-offset-2'>"+
            																"<p class='text-center subtitle'>"+category.name+"</p>"+
            															"</div>"+
            														"</div>"+
            														"<div class='row top-margin-80'>"+
            															"<div class='col-xs-3 col-xs-offset-1'>"+
            																"<img src="+match.homeTeam.getTeamFlagURL()+" class='img-responsive' alt='"+match.homeTeam.name+" team crest/flag'>"+
            															"</div>"+
            															match.getScoreColumn()+
																		"<div class='col-xs-3 col-xs-offset-0'>"+
																			"<img src="+match.awayTeam.getTeamFlagURL()+" class='img-responsive' alt='"+match.awayTeam.name+" team crest/flag'>"+
																		"</div>"+
																	"</div>"+
																	match.getMatchRow()+
																		"<div class='col-xs-5 col-md-5'>"+
																			"<p class='text-center hidden-xs'>"+match.homeTeam.name+"</p>"+
																			"<p class='text-center visible-xs'>"+match.homeTeam.shortName+"</p>"+
																		"</div>"+
																		"<div class='col-xs-5 col-xs-offset-2'>"+
																			"<p class='text-center hidden-xs'>"+match.awayTeam.name+"</p>"+
				 															"<p class='text-center visible-xs'>"+match.awayTeam.shortName+"</p>"+
																		"</div>"+
																	"</div>"+
																	"<div class='row bottomRow'>"+
																		"<div class='col-md-4 col-md-offset-4 top-margin-40'>"+
																			"<p class='status "+match.status.getStatusDIVClass()+"'>"+match.status.name+"</p>"+
																		"</div>"+
																	"</div>"+
            												"</div>");
            			});	//end matches
            		});	//end tournaments
            	}); //end categories
            }); //end sports
		});	//end json complete
    };
}( jQuery ));