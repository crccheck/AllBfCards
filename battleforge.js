/* allbfcards.com */
/* BETA javascript code */
/* to find open tickets, search 'TODO' */


/* IE and older browser compatibility */
if(!Array.prototype.forEach){Array.prototype.forEach=function(fun){var len=this.length>>>0;if(typeof fun!="function")throw new TypeError();var thisp=arguments[1];for(var i=0;i<len;i++){if(i in this)fun.call(thisp,this[i],i,this)}}}
if(!Array.prototype.map){Array.prototype.map=function(fun){var len=this.length>>>0;if(typeof fun!="function")throw new TypeError();var res=new Array(len);var thisp=arguments[1];for(var i=0;i<len;i++){if(i in this)res[i]=fun.call(thisp,this[i],i,this)}return res}}
if(!Array.prototype.some){Array.prototype.some=function(fun){var i=0,len=this.length>>>0;if(typeof fun!="function")throw new TypeError();var thisp=arguments[1];for(;i<len;i++){if(i in this&&fun.call(thisp,this[i],i,this))return true}return false}}
if (!Storage.prototype.setObject)
{
  Storage.prototype.setObject = function(key, value) {
      this.setItem(key, JSON.stringify(value));
  }
}
if (!Storage.prototype.getObject)
{
  Storage.prototype.getObject = function(key) {
    var item = this.getItem(key);
    if (item)
      return JSON.parse(this.getItem(key));
  }
}
function getUrlVars() {
	var map = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		map[key] = value;
	});
	return map;
}
function simplyCopy(obj){
  var temp = {};
  for(var key in obj)
      temp[key] = obj[key];
  return temp;
}

/* debugging */
function debug() { var msg = []; for (var i = 0, n = arguments.length; i<n; ++i) msg.push(arguments[i]); setTimeout(function() { throw new Error("[debug] " + msg.join(' ')); }, 0);}
//window.log=function(){var a="history";log[a]=log[a]||[];log[a].push(arguments);window.console&&console.log[console.firebug?"apply":"call"](console,Array.prototype.slice.call(arguments))};window.logargs=function(a){log(a,arguments.callee.caller.arguments)};


/* search for a card based on the user's search parameters */
callSearch = {
  timer : '',
  _search : function(){
    //todo refactor this now that it's ridiculously long
    var name = $('#search-name').val().toUpperCase(),
      showEra1 = $('#orb-1').is(':checked'),
      showEra2 = $('#orb-2').is(':checked'),
      showEra3 = $('#orb-3').is(':checked'),
      showEra4 = $('#orb-4').is(':checked');
      showUnits      = $('#type-u').is(':checked'),
      showBuildings  = $('#type-b').is(':checked'),
      showSpells     = $('#type-s').is(':checked'),
      showCommons    = $('#rarity-c').is(':checked'),
      showUncommons  = $('#rarity-uc').is(':checked'),
      showRares      = $('#rarity-r').is(':checked'),
      showUltrarares = $('#rarity-ur').is(':checked'),
      showS = $('#defense-s').is(':checked'),
      showM = $('#defense-m').is(':checked'),
      showL = $('#defense-l').is(':checked'),
      showXL = $('#defense-xl').is(':checked'),
      showMS = $('#offense-ms').is(':checked'),
      showMM = $('#offense-mm').is(':checked'),
      showML = $('#offense-ml').is(':checked'),
      showMXL = $('#offense-mxl').is(':checked'),
      showRS = $('#offense-rs').is(':checked'),
      showRM = $('#offense-rm').is(':checked'),
      showRL = $('#offense-rl').is(':checked'),
      showRXL = $('#offense-rxl').is(':checked'),
      showSpecial = $('#offense-special').is(':checked');

    var m2CB = $('#method2 input:not(.none)');  //cache this
    var m2Orbs = {
      fire   : m2CB.filter('.fire:checked').length,
      shadow : m2CB.filter('.shadow:checked').length,
      frost  : m2CB.filter('.frost:checked').length,
      nature : m2CB.filter('.nature:checked').length
    }
    var m2OrbsCheck = simplyCopy(m2Orbs);
    var lastOrb = m2CB.filter(':checked:last').attr('class');
    if (lastOrb) --m2OrbsCheck[lastOrb];
    var orbsTotal = m2Orbs.fire + m2Orbs.shadow + m2Orbs.frost + m2Orbs.nature;

    var editionSearch = 0;
    $('#editionSearch > input').each(function(){ editionSearch += this.value * $(this).is(':checked'); });

    var orbSearch = 0;
    $('#orbSearch > input').each(function(){ orbSearch += this.value * $(this).is(':checked'); });
    
    cardDB.forEach(function(card){
      //todo break out when we get a false to skip more expensive checks
      var matchName = (!name || card.searchName.indexOf(name) !== -1);
      //debug(card.orb);
      if (searchMethod) { // filter cards the same way the game does
        var matchOrbType = orbSearch == (orbSearch | card.orb_id);

        var matchEra = 
          (showEra1 && (card.orb_n == 1)) ||
          (showEra2 && (card.orb_n == 2)) ||
          (showEra3 && (card.orb_n == 3)) ||
          (showEra4 && (card.orb_n == 4));
      
      } else {  // filter cards by era
        var matchOrbType = true;

        var matchEra = (card.orb_n <= orbsTotal) &&
          ((card.orb.match(/R/g) || '').length <= m2Orbs.fire) &&
          ((card.orb.match(/S/g) || '').length <= m2Orbs.shadow) &&
          ((card.orb.match(/B/g) || '').length <= m2Orbs.frost) &&
          ((card.orb.match(/N/g) || '').length <= m2Orbs.nature);
        if (lastOrb) {
          var usedToMatchEra = (card.orb_n <= orbsTotal) &&
            ((card.orb.match(/R/g) || '').length <= m2OrbsCheck.fire) &&
            ((card.orb.match(/S/g) || '').length <= m2OrbsCheck.shadow) &&
            ((card.orb.match(/B/g) || '').length <= m2OrbsCheck.frost) &&
            ((card.orb.match(/N/g) || '').length <= m2OrbsCheck.nature);
          matchEra = matchEra && !usedToMatchEra;
        }
      }

      var matchType = 
        (showUnits     && (card.type_id == 0)) ||
        (showBuildings && (card.type_id == 1)) ||
        (showSpells    && (card.type_id == 2));

      var matchRarity = 
        (showCommons    && (card.rarity == "C")) ||
        (showUncommons  && (card.rarity == "U")) ||
        (showRares      && (card.rarity == "R")) ||
        (showUltrarares && (card.rarity == "UR"));

      var matchEdition = editionSearch & card.edition_id;
      
      var matchSize = (card.type_id != 0) || (
          (showS  && (card.defensetype == 's')) ||
          (showM  && (card.defensetype == 'm')) ||
          (showL  && (card.defensetype == 'l')) ||
          (showXL && (card.defensetype == 'xl'))
        );
      var matchOffense = (card.type_id != 0) || (
          (showMS  && (card.offensetype == 'ms')) ||
          (showMM  && (card.offensetype == 'mm')) ||
          (showML  && (card.offensetype == 'ml')) ||
          (showMXL && (card.offensetype == 'mxl')) ||
          (showRS  && (card.offensetype == 'rs')) ||
          (showRM  && (card.offensetype == 'rm')) ||
          (showRL  && (card.offensetype == 'rl')) ||
          (showRXL && (card.offensetype == 'rxl')) ||
          (showSpecial && (card.offensetype == 'special'))
        );
      

      if (matchName && matchOrbType && matchEra && matchType && matchRarity && matchEdition && matchSize && matchOffense) card.jQuery.show();
      else {
        card.jQuery.hide();
        //debug('hiding',card.name,matchSize,card.defensetype,matchOffense,card.offensetype);
      }
    
    });
    updateCardCount();
  },
  search : function(){
    if (callSearch.timer) { 
      window.clearTimeout(callSearch.timer);
    }
    callSearch.timer = window.setTimeout(callSearch._search,30);
  },
};

/* sort cards */
function sort(field){
  if (field) {
    var main = $('#main');
    //var i = 0;
    main.children('div.card').sort(function(a,b){
      //if (i < 10) debug(field, $(a).data('data')[field] , $(b).data('data')[field]);
      //++i;
      switch (field) {
        case 'name' :
        case 'category' :
        case 'rarity' :
          return $(a).data('data')[field] > $(b).data('data')[field] ? 1 : -1;
        break;
        default:
          return ($(a).data('data')[field] || 0) - ($(b).data('data')[field] || 0);
      }
    }).appendTo(main);
  }
}
jQuery.fn.sort = function() {
  return this.pushStack( [].sort.apply( this, arguments ), [] );
}

/* quick jquery hack taht replaces input elements with images */
jQuery.fn.replaceCB = function(options){
  function resync(source,replacement,options){
    if (source.is(':checked')) {
      replacement.attr('src',options.checked);
    } else {
      replacement.attr('src',options.unchecked);
    }
  }
  
  return this.each(function(){
    //debug(this);
    var cbOption;
    var $originalCheckBox = $(this);
    var $newCheckBox = $originalCheckBox.data('replaceCB');
    if ($newCheckBox && (cbOption = $originalCheckBox.data('replaceCB-options'))) {
      resync($originalCheckBox,$newCheckBox,cbOption);
    } else if (options) {
      //constructor
      var $label = $originalCheckBox.parent().find('label[for='+$originalCheckBox.attr('id')+']');
      $label.hide();
      $newCheckBox = $('<img src="'+($originalCheckBox.is(':checked') ? options.checked : options.unchecked)+'" class="bfWidget" title="'+$label.text()+'"/>')
      .insertBefore(this)
      .click(function(){
        $originalCheckBox[0].click();
        resync($originalCheckBox,$(this),options);
        var name = $originalCheckBox.attr('name');
        if (name) $originalCheckBox.siblings('input[name="'+name+'"]').replaceCB();
      })
      .hover(
        function(){
          if ($originalCheckBox.is(':checked')) {
            $(this).attr('src',options.checkedHover);
          } else {
            $(this).attr('src',options.uncheckedHover);
          }
        },
        function(){
          if ($originalCheckBox.is(':checked')) {
            $(this).attr('src',options.checked);
          } else {
            $(this).attr('src',options.unchecked);
          }
        }
      );
      if (!options.debug) $originalCheckBox.hide();
      $originalCheckBox.data('replaceCB',$newCheckBox);
      $originalCheckBox.data('replaceCB-options',options);
    }
  });
  return this;
};

/* tooltips */
function initHover(){
  if ($(window).width()/2 > $(this).offset().left)
    $(this).children('div.tooltip').css('left','210px').show();
  else
  //debug($(window).width(),$(this).offset().left);
    $(this).children('div.tooltip').css('left','-320px').show();
}
function destroyHover(){
  $(this).children('div.tooltip').hide();
}

/* updated the card count counter */
function updateCardCount(){
  $('#cardCount').text($('#main > .card:visible').length);
}


















/* once the cards are loaded, draw them */
function initCanvas(){
  // todo allow progressive loading, cached data
  if (!loaded.cardDB || !loaded.cardAbilities || !loaded.lootDB) return false;

  // card info
  cardDB.forEach(function(card){
    var abilityHTML = '', abilityTooltip = '', abilities = cardAbilities[card.abilityName] || [];
    var alternateName = card.name.replace(' (promo)','').toUpperCase();
    if (alternateName != card.abilityName)
      abilities = abilities.concat(cardAbilities[alternateName] || []);
    abilities.sort(function(a,b){ return a.order - b.order; }).forEach(function(ability){
      abilityHTML += '<li class="'+ability.abilitytype+'">'+ability.abilityname+'</li>';
      abilityTooltip += '<dt class="'+ability.abilitytype+'">'+ability.abilityname + '</dt><dd>' + ability.description + '</dd>';
    });

    var loot = lootDB[card.abilityName];
    var lootTooltip = '';
    if (loot) {
      lootTooltip += '<hr>'
      loot.sort(function(a,b){ return a.era - b.era; }).forEach(function(map){
        lootTooltip += 'u' + map.era + ' : ' + map.map + ' ' + map.players + 'p<br>';
      });
    }
    
    var orbHTML = '';
    for (var i = 0; i < card.orb.length; i++){
      orbHTML += '<span class="orb'+card.orb[i]+'">'+card.orb[i]+'</span>';
    }
    //var tapped = visibilityDB[card.imageName];
    var tapped = false;
    card.jQuery = $('<div id="'+card.imageName+'" class="card ' + card.color + (tapped ? ' tapped' : '') + '">'
    +'<span class="name">'+card.name+'</span>'
    +'<span class="category">'+(card.unitcount || '') + ' ' + card.category+'</span>'
    +'<span class="cost">'+card.cost+'</span>'
    +'<span class="orbs '+card.affinity+'">'+orbHTML+'</span>'
    +(card.offense ? '<span class="offense">'+card.offense+'</span>' : '')
    +(card.defense ? '<span class="defense">'+card.defense+'</span>' : '')
    +'<ul class="abilities">'+abilityHTML+'</ul>'
    +'<img src="cards/'+card.imageName+'.jpg" alt="">'
    +'<div class="overlay"></div>'
    +'<div class="tooltip">'
      +'<h3>' + card.name + '</h3>'
      +'<h4>' + (card.category || card.type) + '</h4>'
      +'<dl>'+abilityTooltip +'</dl>'+lootTooltip+'</div></div>').data('data',card).appendTo($('#main'));
  });
  $('#main > .card').hover(initHover,destroyHover);
  updateCardCount();

}

/* begin */
var loaded = {
  cardDB : false,
  cardAbilities : false,
  lootDB: false
};
var cardDB, cardAbilities, lootDB;
var searchMethod = true;
var GET = getUrlVars();
var liteMode = !!GET['lite'];
var enableDb = !!localStorage && !!JSON;

$(function(){
  if (liteMode) $('body').addClass('lite');

  $('#toolbar > form').bind('reset',function(){
    window.setTimeout(function(){
      $('#toolbar').find('input[type=checkbox],input[type=radio]').replaceCB();
      $('#method1').addClass('active');
      $('#method2').removeClass('active');
      searchMethod = true;
      callSearch.search();
    },1);
  });
  
  $('#toolbar > form').submit(function(){
    return false;
  });
  $('#method1').click(function(e){
    //console.log('activate method1',this,$(this).hasClass('active'));
    if (!searchMethod) {
      $('#method1').addClass('active');
      $('#method2').removeClass('active');
      searchMethod = true;
      callSearch.search();
    }
  });
  $('#method2').click(function(e){
    //console.log('activate method2',this,$(this).hasClass('active'));
    if (searchMethod) {
      $('#method1').removeClass('active');
      $('#method2').addClass('active');
      searchMethod = false;
      callSearch.search();
    }
  });

  $('#search-name').keyup(callSearch.search);
  $('#toolbar input').click(callSearch.search);

  // hook up replacement UI
  $('#method2 input.none').replaceCB({
    checked : 'img/btn_s_inventory_sort_power_disabled_down.png',
    checkedHover : 'img/btn_s_inventory_sort_power_disabled_downover.png',
    unchecked : 'img/btn_s_inventory_sort_power_disabled_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_power_disabled_over.png',
  });
  $('#method2 input.fire,#orb-fire').replaceCB({
    checked : 'img/btn_s_inventory_sort_power_fire_down.png',
    checkedHover : 'img/btn_s_inventory_sort_power_fire_downover.png',
    unchecked : 'img/btn_s_inventory_sort_power_fire_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_power_fire_over.png',
  });
  $('#method2 input.shadow,#orb-shadow').replaceCB({
    checked : 'img/btn_s_inventory_sort_power_shadow_down.png',
    checkedHover : 'img/btn_s_inventory_sort_power_shadow_downover.png',
    unchecked : 'img/btn_s_inventory_sort_power_shadow_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_power_shadow_over.png',
  });
  $('#method2 input.frost,#orb-frost').replaceCB({
    checked : 'img/btn_s_inventory_sort_power_frost_down.png',
    checkedHover : 'img/btn_s_inventory_sort_power_frost_downover.png',
    unchecked : 'img/btn_s_inventory_sort_power_frost_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_power_frost_over.png',
  });
  $('#method2 input.nature,#orb-nature').replaceCB({
    checked : 'img/btn_s_inventory_sort_power_nature_down.png',
    checkedHover : 'img/btn_s_inventory_sort_power_nature_downover.png',
    unchecked : 'img/btn_s_inventory_sort_power_nature_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_power_nature_over.png',
  });
  $('#orb-1').replaceCB({
    checked : 'img/btn_s_inventory_sort_token_1_down.png',
    checkedHover : 'img/btn_s_inventory_sort_token_1_downover.png',
    unchecked : 'img/btn_s_inventory_sort_token_1_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_token_1_over.png',
  });
  $('#orb-2').replaceCB({
    checked : 'img/btn_s_inventory_sort_token_2_down.png',
    checkedHover : 'img/btn_s_inventory_sort_token_2_downover.png',
    unchecked : 'img/btn_s_inventory_sort_token_2_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_token_2_over.png',
  });
  $('#orb-3').replaceCB({
    checked : 'img/btn_s_inventory_sort_token_3_down.png',
    checkedHover : 'img/btn_s_inventory_sort_token_3_downover.png',
    unchecked : 'img/btn_s_inventory_sort_token_3_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_token_3_over.png',
  });
  $('#orb-4').replaceCB({
    checked : 'img/btn_s_inventory_sort_token_4_down.png',
    checkedHover : 'img/btn_s_inventory_sort_token_4_downover.png',
    unchecked : 'img/btn_s_inventory_sort_token_4_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_token_4_over.png',
  });
  $('#type-u').replaceCB({
    checked : 'img/btn_s_inventory_sort_type_unit_down.png',
    checkedHover : 'img/btn_s_inventory_sort_type_unit_downover.png',
    unchecked : 'img/btn_s_inventory_sort_type_unit_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_type_unit_over.png',
  });
  $('#type-b').replaceCB({
    checked : 'img/btn_s_inventory_sort_type_building_down.png',
    checkedHover : 'img/btn_s_inventory_sort_type_building_downover.png',
    unchecked : 'img/btn_s_inventory_sort_type_building_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_type_building_over.png',
  });
  $('#type-s').replaceCB({
    checked : 'img/btn_s_inventory_sort_type_spell_down.png',
    checkedHover : 'img/btn_s_inventory_sort_type_spell_downover.png',
    unchecked : 'img/btn_s_inventory_sort_type_spell_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_type_spell_over.png',
  });
  $('#rarity-c').replaceCB({
    checked : 'img/btn_s_inventory_sort_rarity_common_down.png',
    checkedHover : 'img/btn_s_inventory_sort_rarity_common_downover.png',
    unchecked : 'img/btn_s_inventory_sort_rarity_common_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_rarity_common_over.png',
  });
  $('#rarity-uc').replaceCB({
    checked : 'img/btn_s_inventory_sort_rarity_uncommon_down.png',
    checkedHover : 'img/btn_s_inventory_sort_rarity_uncommon_downover.png',
    unchecked : 'img/btn_s_inventory_sort_rarity_uncommon_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_rarity_uncommon_over.png',
  });
  $('#rarity-r').replaceCB({
    checked : 'img/btn_s_inventory_sort_rarity_rare_down.png',
    checkedHover : 'img/btn_s_inventory_sort_rarity_rare_downover.png',
    unchecked : 'img/btn_s_inventory_sort_rarity_rare_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_rarity_rare_over.png',
  });
  $('#rarity-ur').replaceCB({
    checked : 'img/btn_s_inventory_sort_rarity_ultra_rare_down.png',
    checkedHover : 'img/btn_s_inventory_sort_rarity_ultra_rare_downover.png',
    unchecked : 'img/btn_s_inventory_sort_rarity_ultra_rare_up.png',
    uncheckedHover : 'img/btn_s_inventory_sort_rarity_ultra_rare_over.png',
  });
  $('#edition-twilight').replaceCB({
    checked : 'img/twilight_s_ultra_rare.png',
    checkedHover : 'img/twilight_s_ultra_rare.png',
    unchecked : 'img/twilight_s_common.png',
    uncheckedHover : 'img/twilight_s_common.png',
  });
  $('#edition-renegade').replaceCB({
    checked : 'img/renegade_ultrarare_s.png',
    checkedHover : 'img/renegade_ultrarare_s.png',
    unchecked : 'img/renegade_common_s.png',
    uncheckedHover : 'img/renegade_common_s.png',
  });
  $('#edition-lostsoul').replaceCB({
    checked : 'img/lostsouls_ultrarare_s.png',
    checkedHover : 'img/lostsouls_ultrarare_s.png',
    unchecked : 'img/lostsouls_common_s.png',
    uncheckedHover : 'img/lostsouls_common_s.png',
  });
  $('#edition-amii').replaceCB({
    checked : 'img/amii_ultrarare_s.png',
    checkedHover : 'img/amii_ultrarare_s.png',
    unchecked : 'img/amii_common_s.png',
    uncheckedHover : 'img/amii_common_s.png',
  });
  $('#toolbar > form > div.radio > input[type=checkbox]').replaceCB({
    checked : 'img/btn_s_tickbox_down.png',
    checkedHover : 'img/btn_s_tickbox_downover.png',
    unchecked : 'img/btn_s_tickbox_up.png',
    uncheckedHover : 'img/btn_s_tickbox_over.png',
  });
  
  
  $('#attach').click(function(){
    $('#toolbar').toggleClass('float');
    //$toolbar.css('position',$toolbar.css('position') == 'absolute' ? 'fixed' : 'absolute');
  });

  $('#sort').change(function(){
    sort(this.value);
  });


  $('#toolbar').show();
  /*
  // load upgrades
  $.ajax({
    url: 'https://spreadsheets.google.com/feeds/list/0AnvTOLnTve5fdHZkTDBTUmV6UHRkQVl4Zy1LaDR0QWc/od6/public/basic?alt=json-in-script',
    dataType: 'jsonp',
    cache: 'true',
    success: function (data){
      var upgrades = data.feed.entry;
      upgrades.forEach(function(cardUpgrade){
        var card = {}, upgradeData = cardUpgrade.content.$t;
        var data = upgradeData.split(': ');
        var n = data.length;
        for (var i = 0; i < n; ++i) {
          var pair = data[i];
          var key,nextKey,value;
          if (i == 0) {
            nextKey = pair;
          } else if (i == n-1) {
            value = pair;
            key = nextKey;
          } else {
            nextKey = pair.substring(pair.lastIndexOf(', ')+2);
            value = pair.substring(0,pair.lastIndexOf(', '));
          }
          if (i) card[key] = value;
          key = nextKey;
        }
        var key = card.cardname + (card.affinity ? '_' + card.affinity : '');
        if (!cardAbilities[key]) cardAbilities[key] = [];
        cardAbilities[key].push(card);

      });
      $('#loading-upgrades').fadeOut(200).remove();
      loaded.cardUpgrades = true;
      initCanvas();
    },
  });
  */

  //return; // debugging
  // load cards
  if (enableDb && !GET['resetDB']) {
    cardDB = localStorage.getObject('cardDB');
    cardAbilities = localStorage.getObject('cardAbilities');
    lootDB = localStorage.getObject('lootDB');
    if (loaded.cardDB = !!cardDB) $('#loading-cards').fadeOut(200).remove();
    if (loaded.cardAbilities = !!cardAbilities) $('#loading-abilities').fadeOut(200).remove();
    if (loaded.lootDB = !!lootDB) $('#loading-loot').fadeOut(200).remove();
    initCanvas();
  }
  
  if (!cardDB) {
    cardDB = [];
    $.ajax({
      url: 'http://spreadsheets.google.com/feeds/list/tT1WZZWP3cl5DUr8Aqwf68A/od6/public/basic?alt=json-in-script',
      dataType: 'jsonp',
      cache: 'true',
      success: function (data, textStatus, XMLHttpRequest){
        var editions = {'Twilight':1, 'Renegade':2, 'Lost Souls':4, 'Amii':8};
        var type = {'unit':0,'squad':0,'creature':0,'building':1,'spell':2};
        var cards = data.feed.entry;
        cards.forEach(function(cardData){
          var card = {},
          data = cardData.content.$t;
          data.split(', ').forEach(function(stat){
            var pair = stat.split(': ');
            card[pair[0]] = pair[1];
          });
          card.orb_id = 8*(card.orb.indexOf('R') != -1) + 4*(card.orb.indexOf('S') != -1) + 2*(card.orb.indexOf('B') != -1) + (card.orb.indexOf('N') != -1);
          card.orb_n = card.orb.length;
          card.type_id = type[card.type] || 0;
          card.edition_id = editions[card.edition] || 1;
          card.searchName = card.name.toUpperCase();
          card.imageName = (card.name + (card.affinity && card.affinity != 'none' ? '_' + card.affinity : '')).replace(/ /g,'-').replace(/'|\(|\)/g,'');
          card.abilityName = (card.name.replace(' (Promo)','') + (card.affinity && card.affinity != 'none' ? '_' + card.affinity : '')).toUpperCase();
          // delete data if a machine friendly version exists and a human friendly version isn't needed
          delete card.edition;
          delete card.type;
          cardDB.push(card);
        });
        $('#loading-cards').fadeOut(200).remove();
        loaded.cardDB = true;
        initCanvas();
        localStorage.setObject('cardDB',cardDB);
      },
    });
  }


  // load abilities
  if (!cardAbilities) {
    cardAbilities = {};
    $.ajax({
      url: 'http://spreadsheets.google.com/feeds/list/tff7StVG7UhAk2_MjaV2RaA/od6/public/basic?alt=json-in-script',
      dataType: 'jsonp',
      cache: 'true',
      success: function (data){
        var abilities = data.feed.entry;
        abilities.forEach(function(cardAbility){
          var card = {}, abilityData = cardAbility.content.$t;
          var dataSplit = abilityData.split(', description: ');
          //var pair = data.match(/^abilityname: (.*), cardname: (.*), affinity: (.*), abilitytype: (.*), order: (.*), description: (.*)$/);
          dataSplit[0].split(', ').forEach(function(stat){
            var pair = stat.split(': ');
            card[pair[0]] = pair[1];
          });
          card.description = dataSplit[1];
          var key = (card.cardname + (card.affinity ? '_' + card.affinity : '')).toUpperCase();
          if (!cardAbilities[key]) cardAbilities[key] = [];
          cardAbilities[key].push(card);
        });
        //debug(uneval(cardAbilities));
        $('#loading-abilities').fadeOut(200).remove();
        loaded.cardAbilities = true;
        initCanvas();
        localStorage.setObject('cardAbilities',cardAbilities);
      },
    });
  }

  // load loot
  if (!lootDB) {
    lootDB = {};
    $.ajax({
      url: 'http://spreadsheets.google.com/feeds/list/0AnvTOLnTve5fdG9Tb3RqVG44WVkwQmxXT2QzU1A2WGc/od7/public/basic?alt=json-in-script',
      dataType: 'jsonp',
      cache: 'true',
      success: function (data, textStatus, XMLHttpRequest){
        var cards = data.feed.entry;
        cards.forEach(function(cardData){
          var card = {},
          data = cardData.content.$t;
          data.split(', ').forEach(function(stat){
            var pair = stat.split(': ');
            card[pair[0]] = pair[1];
          });
          if (card.difficulty) delete card.difficulty;
          if (card.edition) delete card.edition;
          var key = card.cardname.replace(/ \((.*)\)/,"_$1").toUpperCase();
          if (!lootDB[key]) lootDB[key] = [];
          lootDB[key].push(card);
        });
        $('#loading-loot').fadeOut(200).remove();
        loaded.lootDB = true;
        initCanvas();
        localStorage.setObject('lootDB',lootDB);
      },
    });
  }

});













/* DECK BUILDING */
//var visibilityDB = {};
var enableDeckBuilding = !liteMode && !!localStorage;
if (enableDeckBuilding) {


  //visibilityDB = localStorage.getObject('visibilityDB') || {};

  function tap(){
    var $card = $(this);
    var cardData = $card
      //.toggleClass('tapped')
      .data('data');
    if (cardData) {
      //if (visibilityDB[card.imageName]) delete visibilityDB[card.imageName];
      //else visibilityDB[card.imageName] = true;
      //localStorage.setObject('visibilityDB',visibilityDB);
      var activeDeck = $('#decks > div.active > div.deckCards');
      if (activeDeck.length) {
        var deckCard = $('img[rel='+cardData.imageName+']',activeDeck).parent();
        if (deckCard.length) {
          $card.removeClass('tapped');
          deckCard.remove();
        } else {
          $card.addClass('tapped');
          activeDeck.append('<div class="deckCard"><img src="cards/'+cardData.imageName+'.jpg" rel="'+cardData.imageName+'" alt=""></div>');
        }
        $('div.deckControls > input.deckSize',activeDeck.parent()).val($('div.deckCard > img',activeDeck).length);
        saveDecks();
      }
    }
  }
  function tapDeck($deck){
    $deck.addClass('active');
    $('#main > div.tapped').removeClass('tapped');
    $deck.find('img').each(function(){
      $('#'+$(this).attr('rel')).addClass('tapped');
    });
  }
  function saveDecks(){
    var decks = [];
    $('#decks > div.deck').not('.ui-sortable-placeholder').each(function(){
      decks.push({
        name  : $('input.deckname',this).val(),
        className : this.className,
        cards : $.makeArray($('.deckCards img',this)).map(function(deckCard){ return $(deckCard).attr('rel'); })
      });
    });
    localStorage.setObject('userDecks',decks);
  }
  
  function loadDecks(){
    var decks = localStorage.getObject('userDecks') ||
      [{"name":"swift","className":"deck active","cards":["Amazon_frost","Amazon_nature","Burrower","Bandit-Stalker_nature","Bandit-Stalker_shadow","Dreadcharger","Fire-Stalker","Giant-Slayer","Lyrish-Knight","Lyrish-Knight-promo","Nightcrawler","Nightguard_nature","Nomad_nature","Nomad_fire","Scavenger","Scythe-Fiends","Shadow-Insect","Silverwind-Lancers","Stormsinger_nature","Strikers","Swiftclaw","Werebeasts"]}];
    decks.forEach(function(deck){
      addDeck(deck);
    });
  }

  function addDeck(deck){
    var deckName = deck && deck.name || '',
    deckClassName = deck && deck.className || 'deck active',
        deckCards = deck && deck.cards || [];
    var deckControls = '<div class="handle"></div><div class="deckControls">'
    +'<input type="text" class="deckname" value="'+deckName+'">'
    +'<input type="text" readonly="readonly" class="deckSize" value="'+deckCards.length+'">'
    +'<span class="button hide" title="Hide Deck">Hide</span>'
    +'<span class="button zoom" title="Show Only This Deck">Zoom</span>'
    +'<span class="button share" title="Share This Deck">Share</span>'
    +'<span class="button delete" title="Delete This Deck">Delete</span>'
    // todo classes: hilight hide none
    +'</div>';
    var deckCardsHtml =
      deckCards.map(function(card){ if (card) return '<div class="deckCard"><img src="cards/'+card+'.jpg" rel="'+card+'" alt=""></div>' })
      .join('');
    var $deck = $('<div class="'+deckClassName+'">'+deckControls+'<div class="deckCards">'+deckCardsHtml+'</div></div>');
    $('#decks > div.active').removeClass('active');
    $deck.appendTo($('#decks'));
    $('input.deckname',$deck).click(function(){$deck.removeClass('hide');}).change(saveDecks);
    $('.button.hide',$deck).click(function(){
      $deck.addClass('hide');
      saveDecks();
      $('#footer').css('margin-bottom',$('#decks').outerHeight() + 'px');
    });
    $('.button.zoom',$deck).click(function(){
      var search = $.makeArray($('.deckCards img',$deck)).map(function(deckCard){ return $(deckCard).attr('rel'); });
      $('#main > div.card').each(function(){
        var cardId = this.id;
        if (search.some(function(element){ return element === cardId; })) $(this).show();
        else $(this).hide();
      });
      updateCardCount();
    });
    $('.button.delete',$deck).click(function(){
      var n_cards = $('.deckCards img',$deck).length;
      if ((n_cards == 0) || confirm("Delete Deck? This deck has "+n_cards+" card(s).")) {
        $deck.remove();
        saveDecks(); 
        $('#footer').css('margin-bottom',$('#decks').outerHeight() + 'px');
      }
    });
    $('.button.share',$deck).click(function(){
      var deckCardIds = $.makeArray($('.deckCards img',$deck)).map(function(deckCard){ return $(deckCard).attr('rel'); });
      var newDeck = prompt("Copy/Paste a deck using this code:",deckCardIds.join(','));
      if (newDeck) {
        var deckCardsHtml =
          newDeck.split(',').map(function(card){ if (card) return '<div class="deckCard"><img src="cards/'+card+'.jpg" rel="'+card+'" alt=""></div>' })
          .join('');
        $('div.deckCards',$deck).html(deckCardsHtml);
        saveDecks();
      }
    });
    $('div.deckCards',$deck).sortable({
      update : saveDecks,
      opacity : 0.8,
      tolerance: 'pointer',
    });
    $('#footer').css('margin-bottom',$('#decks').outerHeight() + 'px');
  }
  $(function(){
    $('#main > div.card').live('click',tap);  // adds the card to the active deck
    $('#decks > div.deck').live('click',function(){ // makes the current deck the active one
      $('#decks > div.active').removeClass('active');
      tapDeck($(this));
    });
    $('#decks img').live('click',function(){  // move to the card clicked on
      var card = $('#' + this.getAttribute('rel'));
      if (card.length) {
        var offset = $('#toolbar').hasClass('float') ? $('#toolbar').outerHeight() : 0;
        $(document).scrollTop(card.position().top - offset);
      }
    });
    $('#addDeck').click(function(){ addDeck(); });
    // todo add a way to reset local storage
    // localStorage.clear()
    loadDecks();
    $('#decks').sortable({
      update : saveDecks,
      handle: '.handle',
      items: 'div.deck',
      //tolerance: 'pointer',
    }).disableSelection();
    $('#footer').css('margin-bottom',$('#decks').outerHeight() + 'px');
  });
} else {
  $(function(){
    $('#decks').hide();
  });
}
