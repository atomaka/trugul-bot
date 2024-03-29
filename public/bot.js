var BOT_WORKER_MONEY = 1;
var BOT_SLIME_MONEY = 10;
var CHAT_LIMIT = 150;
var SAFE_SOLDIER_COUNT = 50000000;

var botLoop;
var botGlobalBossTimer;
var botPurchasingTimer;
var botPaused = true;
var botPurchasing = false;
var botSleeping = false;
var botRaiding = false;
var botFightingRandomBoss = false;
var botFightingGlobalBoss = false;
var botBuySlimes = false;
var botBuyWorkers = true;
var botFightGlobal = true;
var botFightRandom = true;
var botSpendBossCoins = true;
var botChatClear = true;
var botSaveSpears = false;
var botRaidTarget = null;
var botLastRandom = 0;
var botLastRaid = 0;
var botLastPurchase = 0;
var botUser = null;

function mainLoop() {
  if($('#popup').is(':visible')) {
    var botPopupTitle = $('#popup p[name="title"]').text();
    switch(botPopupTitle) {
      case 'Raid report':
        var botMessage = botBuildRaidReport($('#popup div[name="content"]').text());
        console.log(botMessage);
        botLastRaid = botTimestamp();
        clickButton('CONTINUE');
        break;
      case 'SUMMON BOSS':
        clickButton('Summon Boss');
        botLastRandom = botTimestamp();
        break;
      case 'Are you sure?':
        if(checkPopupContent('drop')) {
          clickButton('Drop Item');
        } else {
          clickButton('Activate Item');
        }
        break;
      case 'ARE YOU SURE?':
      case 'CONFIRM PURCHASE':
        if(botPurchasing) {
          clickButton('Yes');
          botPurchasing = false;
        } else {
          clickButton('No');
        }
        break;
      case 'Raid':
        if(haveRaidTarget() === true) {
          if(botRaiding) {
            clickButton('Raid!');
            botRaiding = false;
          } else {
            clickButton('Nevermind');
          }
        }
        break;
      case 'CONFIRM':
        if(botPurchasing) {
          clickButton('Yes');
          botPurchasing = false;
        }
        break;
      case 'WHOOPS!':
      case 'BATTLE REPORT':
      case 'Battle Report':
      case 'ACTIVITY PASSED!':
      case 'SCENARIO #1':
      case 'Lobby closed':
      case 'Wait':
      case 'ACTIVITY FAILED!':
      case 'Game in progress':
      case 'User not found':
        clickButton('CONTINUE');
        break;
      default:
        console.log('Unknown popup: ' + botPopupTitle);
        break;
    }
  } else {
    //RANDOM BOSS
    if(randomBossRefreshing() === true && botFightingRandomBoss === true && botFightingGlobalBoss === false)  {
      botFightingRandomBoss = false;
    } else if(randomBossRefreshing() === false && botFightingRandomBoss === false && botFightRandom === true && haveSoldiers() === true) {
      clickSelector('#randomBossPortal a');
      botFightingRandomBoss = true;
    } else if(botTimestamp() > botLastRandom + 180 && botFightRandom === true && haveSoldiers() === true) {
      clickSelector('#randomBossPortal a');
      botFightingRandomBoss = true;
    }

    //RANDOM BOSS MOBS
    if(haveSlimes(SAFE_SOLDIER_COUNT) === false && botFightRandom === true && botPurchasing === false) {
      setBotToPurchasing();
      clickSelector('button[name="buyx-knight"]');
      botFillIn('input[name="x_amount"]', SAFE_SOLDIER_COUNT);
      clickButton("Buy");
    }

    if(haveCreepers(SAFE_SOLDIER_COUNT) === false && botFightRandom === true && botPurchasing === false) {
      setBotToPurchasing();
      clickSelector('button[name="buyx-advknight"]');
      botFillIn('input[name="x_amount"]', SAFE_SOLDIER_COUNT);
      clickButton("Buy");
    }

    //GLOBAL BOSS
    if(globalBossRefreshing() === true && botFightingGlobalBoss === true) {
      clearInterval(botGlobalBossTimer);
      botFightingGlobalBoss = false;
    } else if(globalBossRefreshing() === false && botFightingGlobalBoss === false && botFightGlobal === true) {
      setTimeout(function() {
        clickSelector('span[name="timeRemaining"]:contains("JOIN") a');
      }, 4000);
      botGlobalBossTimer = setInterval(fightGlobalBoss, 50);
      botFightingGlobalBoss = true;
    }

    //ACTIVATE BUFFS
    if(inactiveBuffs()) {
      activateBuffs();
    }

    //RAID
    if(raidRefreshing() === false && haveRaidTarget() === true && internalRaidRefreshing() === false) {
      clickSelector('button[name="raid_button"]');
      botFillIn('input[name="raid_user"]', botRaidTarget);
      botRaiding = true;
    }

    //PURCHASES
    if(botTimestamp() > botLastPurchase + 5 && botPurchasing === true) {
      botPurchasing = false;
    }

    //BUY SCIENTISTS
    if(haveBossCoins(1) === true && haveCheapLabor() === true && botPurchasing === false && haveMaxWorker('capturedminion') && botSpendBossCoins === true) {
      setBotToPurchasing();
      clickSelector('button[name="hiremax_scientists"]');
    }

    //BUY SLIMES
    if(botBuySlimes === true && haveTrillions(BOT_SLIME_MONEY) === true && botPurchasing === false) {
      setBotToPurchasing();
      clickSelector('button[name="buymax-knight"]');
    }

    //BUY WORKERS
    if(botBuyWorkers === true && haveTrillions(BOT_WORKER_MONEY) === true && haveCheapLabor() === true && botPurchasing === false) {
      setBotToPurchasing();
      clickSelector('button[name="buymax-' + mostEfficientWorker() + '"]');
    }
    if(botBuyWorkers === true && haveCheapLabor() === true && botPurchasing === false && haveBossCoins(9) === true && botSpendBossCoins === true) {
      setBotToPurchasing();
      clickSelector('button[name="buymax-capturedminion"]');
    }
  }

  //CLEAR CHAT
  if(haveChatLines(CHAT_LIMIT) === true && botChatClear === true) {
    $('#chatbox div:lt(' + Math.ceil(CHAT_LIMIT  * .2) + ')').remove();
  }
}

botDetectUser();
botToggle();

function activateBuffs() {
  $('div[name="items_holder"]').children().each(function() {
    var itemHolder = $(this);

    if(itemHolder.attr('item') != 'map') {
      if(itemHolder.attr('item') != 'godspear_fragment' || botSaveSpears === false || haveMaxItems()) {
        var itemButton = itemHolder.find('button:contains("Activate")');
        if(itemButton.length > 0) {
          itemButton.get(0).click()
        }
      }
    } else {
      var itemButton = itemHolder.find('button:contains("Drop")');
      itemButton.get(0).click();
    }
  });
}

function haveMaxItems() {
  return convertToNumber($('span[name="item_count"').text().split('/')[0]) >= 17;
}

function setBotToPurchasing() {
  botPurchasing = true;
  botLastPurchase = botTimestamp();
}

function haveSlimes(value) {
  return convertToNumber($('tr[name="knight"] span[name="owned"]').text()) >= value;
}

function haveCreepers(value) {
  return convertToNumber($('tr[name="advknight"] span[name="owned"]').text()) >= value;
}

function haveChatLines(value) {
  if($('#chatbox').children().length > value) {
    return true;
  } else {
    return false;
  }
}

function haveMaxWorker(type) {
  var worker = $('tr[name="' + type + '"]').find('span[name="owned"]').text();
  worker = worker.replace(/\s+/g, '');
  var workerArray = worker.split('/');

  return convertToNumber(workerArray[0]) == convertToNumber(workerArray[1]);
}

function botDetectUser() {
  botUser = $('#playerName').text();
}

function botSendChat(message) {
  botFillIn('#chat_msg', message);
  var e = jQuery.Event("keypress");
  e.which = 13;
  e.keyCode = 13;
  $("#chat_msg").trigger(e);
}

function mostEfficientWorker() {
  var bestValueWorker;
  var bestValue;
  $('table[name="workers"] > tbody').children().each(function() {
    var workersTable = $(this);
    if(workersTable.is('[name]') && workersTable.attr('name') != 'capturedminion' && workersTable.attr('name') != 'gb_capturedminion') {
      var price = convertToNumber(workersTable.find('span[name="price"]').text());
      var opm = convertToNumber(workersTable.find('span[name="opm"]').text());
      var value = opm / price;

      if(bestValueWorker == null || bestValue < value && haveMaxWorker(workersTable.attr('name')) === false) {
        bestValueWorker = workersTable.attr('name');
        bestValue = value;
      }
    }
  });

  return bestValueWorker;
}

function internalRaidRefreshing() {
  if(botTimestamp() > botLastRaid + 300) {
    return false;
  } else {
    return true;
  }
}

function haveSoldiers() {
  return haveSlimes(1) && haveCreepers(1);
}

function chatMonitor() {
  $('#chatbox, #groupchatbox').bind('DOMSubtreeModified', function() {
    var lastMessage = $(this).find('.chat-message').last();
    if(chatIsPM(lastMessage) || chatHasName(lastMessage)) {
      var user = lastMessage.find('.username').text().trim();
      var content = lastMessage.find('.message').text().trim();
      console.log('CHAT (' + user + '): ' + content);
    }
  });
}

function chatIsPM(message) {
  return message.find('.chat-pm').length > 0;
}

function chatHasName(message) {
  if(botUser == null) {
    return false;
  }
  var string = message.find('.message').text();
  return (new RegExp('\\b' + botUser + '\\b')).test(string);
}

function botTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function botFillIn(selector, text) {
  $(selector).val(text);
}

function raidRefreshing() {
  if($('span[name="raidtime"]').css('display') == 'none') {
    return false;
  } else {
    return true;
  }
}

function haveRaidTarget() {
  if(botRaidTarget == null) {
    return false;
  } else {
    return true;
  }
}

function botBuildRaidReport(message) {
  var botAttacker, botDefender;
  var botRaidUser;
  if(/You.? were raided by (.*?).? /.exec(message)) {
    botRaidUser = /You.? were raided by (.*?).? /.exec(message)[1];
    botAttacker = botRaidUser;
    botDefender = botUser;
  } else {
    botRaidUser = /You .*? the raid against (.*?)! /.exec(message)[1];
    botAttacker = botUser;
    botDefender = botRaidUser;
  }
  var botRaidSoldiers = /! .*? lost (.*?) soldiers/.exec(message)[1];
  var botRaidResult = (/won/.exec(message) !== null) ? 'won' : 'lost';
  var botRaidStolen = (/steal (.*?) from/.exec(message) !== null) ? /steal (.*?) from/.exec(message)[1] : '$0';

  var botStolen = (botRaidResult == 'won') ? botRaidStolen : '-' + botRaidStolen;

  $.post('http://shielded-dusk-2170.herokuapp.com/', { raid: { attacker: botAttacker, defender: botDefender, soldiers: botRaidSoldiers, money: botStolen}});

  return "RAIDED (" + botRaidUser + "): " + botRaidResult + "; soldiers: -" + botRaidSoldiers + "; " + botRaidResult + " money: " + botRaidStolen;
}

function haveTrillions(number) {
  if(convertToNumber($('#money_display').text()) > trillions(number)) {
    return true;
  } else {
    return false;
  }
}

function convertToNumber(string) {
  if(string.indexOf('M') > -1) {
    return Number(string.replace(/[^0-9\.]+/g, '')) * 1000000;
  } else if(string.indexOf('B') > -1) {
    return Number(string.replace(/[^0-9\.]+/g, '')) * 1000000000;
  } else if(string.indexOf('T') > -1) {
    return Number(string.replace(/[^0-9\.]+/g, '')) * 1000000000000;
  } else if(string.indexOf('Qa') > -1) {
    return Number(string.replace(/[^0-9\.]+/g, '')) * 1000000000000000;
  } else {
    return Number(string.replace(/[^0-9\.]+/g, ''));
  }
}

function trillions(number) {
  return number * 1000000000000;
}

function haveBossCoins(value) {
  if(convertToNumber($('#bc_display').text()) >= value) {
    return true;
  } else {
    return false;
  }
}

function haveCheapLabor() {
 if($('span[name="scientists_price"]').text() == "1 BC") {
    return true;
 } else {
   return false;
 }
}

function inactiveBuffs() {
  if($('button:contains("Activate")').length > 0) {
    return true;
  } else {
    return false;
  }
}

function randomBossRefreshing() {
  if($('span[name="timer"]').is(':visible')) {
    return true;
  } else {
    return false;
  }
}

function globalBossRefreshing() {
  if($('span[name="timeRemaining"]:contains("min"), span[name="timeRemaining"]:contains("sec")').length > 0) {
    return true;
  } else {
    return false;
  }
}

function fightGlobalBoss() {
  if($('img[name="globalBossImg"]').is(':visible')) {
    $('img[name="globalBossImg"]').get(0).click();
  }
}

function clickButton(text) {
  $('#popup span button:contains("' + text + '")').get(0).click();
}

function clickSelector(selector) {
  $(selector).get(0).click();
}

function checkPopupContent(text) {
  if($('#popup div[name="content"]:contains("' + text + '")').length > 0) {
    return true;
  } else {
    return false;
  }
}

function botSetTarget(username) {
  botRaidTarget = username;
}

function botClearTarget() {
  botRaidTarget = null;
}

function botToggle() {
  if(botPaused) {
    console.log('Playing bot');
    botLoop = setInterval(mainLoop, 1000);
    botPaused = false;
  } else {
    console.log('Pausing bot');
    clearInterval(botLoop);
    botPaused = true;
  }
}

function botToggleSlimes() {
  if(botBuySlimes) {
    console.log('Stopping slime purchases');
    botBuySlimes = false;
  } else {
    console.log('Starting slime purchases');
    botBuySlimes = true;
  }
}

function botToggleWorkers() {
  if(botBuyWorkers) {
    console.log('Stopping worker purchases');
    botBuyWorkers = false;
  } else {
    console.log('Starting worker purchases');
    botBuyWorkers = true;
  }
}

function botToggleGlobal() {
  if(botFightGlobal) {
    console.log('Stopping global fighting');
    botFightGlobal = false;
  } else {
    console.log('Starting global fighting');
    botFightGlobal = true;
  }
}

function botToggleRandom() {
  if(botFightRandom) {
    console.log('Stopping random fighting');
    botFightRandom = false;
  } else {
    console.log('Starting random fighting');
    botFightRandom = true;
  }
}

function botToggleUI() {
  clickSelector('a[name="portal"]');
  clickSelector('button[name="vault_hide"]');
  $('a[name="bossPortal"] > img').toggle();
}

function botToggleSleep() {
  if(botSleeping) {
    console.log('Stopping sleep mode');
    botFightRandom = true;
    botFightGlobal = true;
    botSleeping = false;
  } else {
    console.log('Starting sleep mode');
    botFightRandom = false;
    botFightGlobal = false;
    botBuySlimes = false;
    botSleeping = true;
  }
}

function botToggleChatClear() {
  if(botChatClear) {
    console.log('Stopping chat clearing');
    botChatClear = false;
  } else {
    console.log('Starting chat clearing');
    botChatClear = true;
  }
}

function botToggleBossCoins() {
  if(botSpendBossCoins) {
    console.log('Stopping spending boss coins');
    botSpendBossCoins = false;
  } else {
    console.log('Starting spending boss coins');
    botSpendBossCoins = true;
  }
}

function botToggleSaveSpears() {
  if(botSaveSpears) {
    console.log('Stopping saving spears');
    botSaveSpears = false;
  } else {
    console.log('Starting saving spears');
    botSaveSpears = true;
  }
}

function botHelp() {
  console.log('bt(): Toggle for the entire bot.');
  console.log('bs(): Toggle "sleep mode." Disables all actions, but logs raids and chat.');
  console.log('bts(): Toggle auto-slime purchasing.');
  console.log('btw(): Toggle auto-worker purchasing (detects most efficient).');
  console.log('btu(): Toggle the UI (probably only works once).');
  console.log('btg(): Toggle the global boss.');
  console.log('btr(): Toggle the random boss.');
  console.log('btc(): Toggle the chat clear.');
  console.log('btb(): Toggle boss coins spending.');
  console.log('bta(): Toggle saving of spears.');
  console.log('bst("username"): Set a target to raid every 5 minutes.');
  console.log('bct(): Clear the raid target.');
}

function bt() { botToggle(); }
function bs() { botToggleSleep(); }
function bts() { botToggleSlimes(); }
function btw() { botToggleWorkers(); }
function btu() { botToggleUI(); }
function btg() { botToggleGlobal(); }
function btr() { botToggleRandom(); }
function btc() { botToggleChatClear(); }
function btb() { botToggleBossCoins(); }
function bta() { botToggleSaveSpears(); }
function bst(username) { botSetTarget(username); }
function bct() { botClearTarget(); }
