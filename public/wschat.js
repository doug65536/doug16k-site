(function(window, $, tldLookup) {
    "use strict";
    
    var chatUsername = $('.chat-username'),
        chatMessages = $('.chat-messages'),
        chatUsername = $('.chat-username'),
        problemIndicator = $('.chat-problem'),
        username,
        chatEntry = $('.chat-entry'),
        chatMessage = $('.chat-message').remove(),
        chatSender = chatMessage.find('.chat-sender'),
        chatText = chatMessage.find('.chat-text'),
        chatTime = chatMessage.find('.chat-time'),
        lastKnownMessage = -1,
        localStorage = window.localStorage,
        currentMessage = -1,
        preservedMessage,
        messageLimit = 128;
    
    var markupRenderTable = [
        {
            re: /(`+)(.*?)\1/,
            handler: function(match) {
                return $('<span/>', {
                    'class': 'chat-code',
                    text: match[2]
                });
            }
        },
        {
            re: /\[(.*?)\]\((http.*)\)/, 
            handler:  function(match) {
                return $('<a/>', {
                    'class': 'chat-link',
                    'href': match[2],
                    text: match[1]
                });
            }
        },
        {
            re: /(http\S+)\b/, 
            handler:  function(match) {
                return $('<a/>', {
                    'class': 'chat-link',
                    'href': match[1],
                    text: match[1]
                });
            }
        },
        {
            re: /(www\..*)\b/,
            handler:  function(match) {
                return $('<a/>', {
                    'class': 'chat-link',
                    'href': 'http://' + match[1],
                    text: match[1]
                });
            }
        },
        {
            re: new RegExp('(\\S+\\.(?:' +
                tldLookup.map(function(tld) {
                    return '(?:' + tld + ')';
                }).join('|') + '))\\b', 'i'),
            handler:  function(match) {
                return $('<a/>', {
                    'class': 'chat-link',
                    'href': 'http://' + match[1],
                    text: match[1]
                });
            }
        },
        {
            re: /(\*+)(.+?)\1/,
            handler: function(match) {
                switch (match[1].length) {
                case 1:
                    return $('<i/>', {
                        text: match[2]
                    });
                case 2:
                    return $('<b/>', {
                        text: match[2]
                    });
                }
            }
        }
    ];
    
    $(document).on('hashchange', function(event) {
        handleHash();
    });
    handleHash();
    
    if (localStorage) {
        username = localStorage.getItem('username');
        if (username)
            setUsername(username);
    }
    
    chatUsername.on('input change', function(event) {
        username = chatUsername.val();
        chatText.prop('disabled', 
            !username || !username.length);
        
        if (localStorage)
            localStorage.setItem('username', username);
    });
        
    if (!username)
        assignUsername();
    
    chatEntry.on('keypress', function(event) {
        var message = chatEntry.val();
        switch (event.which) {
        case 13:
            chatEntry.prop('disabled', true);
            sendMessage(username, message)
            .then(function() {
                // Clear the field
                chatEntry.val('');
                chatEntry.prop('disabled', false).focus();
            }, function(err) {
                // Leave unsent value in the field
                chatEntry.prop('disabled', false).focus();
            });
            break;
        }
    }).on('keydown', function(event) {
        var messages,
            message,
            dir,
            id,
            text;
        
        switch (event.which) {
        case 38:
        case 40:
        case 27:
            // Direction of message index change
            dir = event.which === 38 ? 1 : 
                event.which === 40 ? -1 : 0;
            
            event.preventDefault();
            
            if (dir === 0) {
                // escape
                if (currentMessage !== -1) {
                    chatEntry
                        .val(preservedMessage)
                        .removeClass('chat-editing');
                    preservedMessage = '';
                    currentMessage = -1;
                }
                return;
            }
            
            messages = ownMessages();
            
            if (dir < 0 && currentMessage < 0)
                return;
            
            // If pressing up from new chat message, save it
            if (dir > 0 && currentMessage < 0)
                preservedMessage = chatEntry.val();
            
            if (messages.selectedIndex === 
                messages.all.length - 1 && dir < 0) {
                
            }

            if (currentMessage < 0) {
                message = messages.all.first();
            } else if (messages.selectedIndex === 0 && dir < 0) {
                message = $();
            } else if ((messages.selectedIndex === 
                    messages.length - 1) && dir > 0) {
                message = $();
            } else {
                message = messages.all.eq(messages.selectedIndex+dir);
            }
            if (message.length) {
                text = message.attr('data-message');
                id = +message.attr('data-messageid');
                currentMessage = id;
                chatEntry.val(text).addClass('chat-editing');
            } else if (dir < 0) {
                chatEntry.val(preservedMessage).removeClass('chat-editing');
                currentMessage = -1;
                preservedMessage = '';
            }
            break;
            
        }
        
        function ownMessages() {
            var messages,
                selectedIndex;
            
            messages = chatMessages.children('.chat-message-own');
            messages.each(function(i) {
                var id = +$(this).attr('data-messageid');
                if (id === currentMessage)
                    selectedIndex = i;
            });
            
            return {
                all: messages,
                selectedIndex: selectedIndex
            };
        }
    }).focus();
    
    chatMessages.on('wheel', function(event) {
        event.preventDefault();
        
        var oe = event.originalEvent,
            delta = oe.deltaY,
            scroll = chatMessages.scrollTop(),
            dist = 75;
        
        chatMessages.scrollTop(scroll -
            Math.sign(delta) * dist);
    }).on('keydown', function(event) {
        var dist,
            pageHeight = chatMessages.innerHeight(),
            lineHeight = 24,
            panWidth = 24,
            scroll,
            dist = { x: 0, y: 0 };
        
        scroll = chatMessages.scrollTop();
        
        switch (event.which) {
        case 33:// pgup
            dist.y = -height; break;
        case 34:// pgdn
            dist.y = height; break;
        case 35:// end
            dist.x = +Infinity; break;
        case 36:// home 
            dist.x = -Infinity; break;
        case 37:// left
            dist.x = -panWidth; break;
        case 38:// up
            dist.y = -lineHeight; break;
        case 39:// right
            dist.x = panWidth; break;
        case 40:// down
            dist.y = lineHeight; break;
        }
        if (dist.x) {
            scroll = chatMessages.scrollLeft();
            chatMessage.scrollLeft(scroll + dist.x);
        }
        if (dist.y) {
            scroll = chatMessages.scrollTop();
            chatMessage.scrollTop(scroll + dist.y);
        }
        if (dist.x || dist.y)
            event.preventDefault();
    });
    
    update(lastKnownMessage);
    
    function handleHash() {
        
    }
    
    function setUsername(name) {
        if (name)
            chatUsername.val(name).trigger('change');
        return name;
    }
    
    function assignUsername() {
        return $.get('/api/wschat/unique-username')
            .then(function(response) {
                if (response.username)
                    return setUsername(response.username);
            });
    }
    
    function sendMessage(sender, message, backoff) {
        var later;
        
        if (!backoff)
            return attempt();
        
        console.log('sendMessage retrying with backoff=', backoff);
        
        later = $.Deferred();
        setTimeout(function(later) {
            later.resolve(attempt());
        }, backoff, later);
        return later.promise();
        
        function attempt() {
            return $.post({
                url: '/api/wschat/message/stream',
                contentType: 'application/json',
                data: JSON.stringify({
                    sender: sender,
                    message: message
                })
            }).then(function(response) {
                if (backoff)
                    console.log('sendMessage succeeded at backoff=', backoff);
                return response;
            }, function(err) {
                console.log('sendMessage error:', err);
                backoff = (backoff && (backoff * 2)) || 100;
                backoff = Math.min(120000, backoff);
                return sendMessage(sender, message, backoff);
            });
        }
    }
    
    function reverseMatches(regex, input) {
        var output = [],
            match;
        regex.lastIndex = 0;
        while (!!(match = regex.exec(input)))
            output.unshift(match);
        return output;
    }
    
    function createMessageIndirect(data) {
        var message,
            codeFragments,
            parts,
            lastEnd,
            input,
            i,
            id,
            part,
            links, linkText, linkUrl,
            timestamp = +Date.parse(data.updatedAt),
            message = renderMessage(data.message);
        
        id = 'chat-' + data.id;
        
        chatMessage.attr({
            'data-messageid': data.id,
            'data-sender': data.sender,
            'data-timestamp': timestamp,
            'data-message': data.message,
            'id': id,
            'class': data.sender === username
                ? 'chat-message chat-message-own'
                : 'chat-message chat-message-not-own'
        });

        chatTime.empty().append(renderTimestamp(id, timestamp));

        chatSender.text(data.sender);
        
        chatText.empty().append(message);

        return chatMessage.clone();
    }
    
    function renderTimestamp(id, ts) {
        var date = new Date(ts),
            datetime,
            text,
            textnode,
            span;
        
        datetime = [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds(),
            0,
            0
        ];
        
        datetime[7] = datetime[3] % 12;
        datetime[7] = datetime[7] || 12;
        datetime[8] = datetime[3] >= 12 ? 'pm' : 'am';
        
        text = [
            //'[', 
            (' ' + datetime[7]).substr(-2), 
            ':', 
            ('0' + datetime[4]).substr(-2), 
            datetime[8], 
            //']'
        ].join('');
        
        return $('<a/>', {
            href: '#' + id,
            'title': String(new Date(ts)),
            text: text
        });
    }
    
    // Returns an array of elements
    function renderMessage(input) {
        var //matches = reverseMatches(/(`+)(.*?)\1/g, input),
            result = [input],
            didany;
        
        // Keep applying the first rule until no more rules ran
        // while loop empty body just repeats its condition
        while (result.some(function(item, index, result) {
            if (typeof item !== 'string')
                return;
            
            // In priority order
            return markupRenderTable.some(function(entry) {
                var match = item.match(entry.re),
                    before,
                    replacement,
                    after;
                if (!match)
                    return;
                
                before = item.substr(0, match.index);
                after = item.substr(match.index + match[0].length);
                replacement = entry.handler(match);
                result.splice(index, 1, before, replacement, after);
                return true;
            });
        }));
        
        return result.filter(function(node) {
            // Get rid of empty string fragments
            return node !== '';
        }).map(function(node) {
            // Wrap strings in spans
            var span;
            if (typeof node === 'string') {
                return $('<span/>', {
                    'class': 'chat-text-span',
                    text: node
                });
            }
            return node;
        }).reduce(function(parent, node) {
            // Append everything to a paragraph
            parent.append(node);
            return parent;
        }, $('<p/>'));
    }        
    
    // Infinite get request, never resolves,
    // endlessly gets more messages
    // but might reject
    function update(lastKnownMessage, backoff) {
        return $.getJSON({
            url: '/api/wschat/message/stream',
            data: {
                since: lastKnownMessage
            },
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-Auth-Token', '42');
            },
            timeout: 36 * 6 * 1000
        }).then(function(response) {
            if (response.messages) {
                var items,
                    animClassName,
                    frag = $(document.createDocumentFragment());
                animClassName = response.messages.length > 8 ? 
                    'chat-load' : 'chat-new';
                items = response.messages.map(function(message) {
                    var item;
                    
                    lastKnownMessage = Math.max(
                        lastKnownMessage,
                        message.id);
                    item = createMessageIndirect(message);
                    item.addClass(animClassName);
                    frag.prepend(item);
                    return item.get(0);
                });
                chatMessages.prepend(frag);
                chatMessages.children().slice(messageLimit).remove();
                setTimeout(function() {
                    $(items).queue(function() {
                        $(this).removeClass(animClassName);
                    });
                }, 32);
            }
            return update(lastKnownMessage);
        }, function(err) {
            // Exponential backoff from 200ms up to 10s per retry
            if (!backoff)
                netHavingProblem(true);
            
            // Do a ping request to quickly clear error indication
            $.get('/api/wschat/message/ping')
            .then(function() {
                netHavingProblem(false);
            }, function() {
                netHavingProblem(true);
            });

            console.log('error=', err, 'backoff=', backoff);
            setTimeout(function() {
                update(lastKnownMessage,
                    Math.min((backoff || 100) * 2, 10000));
            }, backoff || 0);
        }, function(progress) {
            console.log(progress);
        });
    }
    
    function netHavingProblem(problem) {
        problemIndicator.toggleClass('hidden', !problem);
    }
}(window, jQuery, [
    // http://data.iana.org/TLD/tlds-alpha-by-domain.txt
    // Version 2016061100, Last Updated Sat Jun 11 07:07:01 2016 UTC
    'AAA', 'AARP', 'ABB', 'ABBOTT', 'ABBVIE', 'ABOGADO', 'ABUDHABI', 'AC',
    'ACADEMY', 'ACCENTURE', 'ACCOUNTANT', 'ACCOUNTANTS', 'ACO', 'ACTIVE',
    'ACTOR', 'AD', 'ADAC', 'ADS', 'ADULT', 'AE', 'AEG', 'AERO', 'AETNA',
    'AF', 'AFL', 'AG', 'AGAKHAN', 'AGENCY', 'AI', 'AIG','AIRBUS',
    'AIRFORCE', 'AIRTEL', 'AKDN', 'AL', 'ALIBABA', 'ALIPAY', 'ALLFINANZ',
    'ALLY', 'ALSACE', 'ALSTOM', 'AM', 'AMICA', 'AMSTERDAM', 'ANALYTICS',
    'ANDROID', 'ANQUAN', 'AO', 'APARTMENTS', 'APP', 'APPLE', 'AQ',
    'AQUARELLE', 'AR', 'ARAMCO', 'ARCHI', 'ARMY', 'ARPA', 'ARTE', 'AS',
    'ASIA', 'ASSOCIATES', 'AT', 'ATTORNEY', 'AU', 'AUCTION', 'AUDI',
    'AUDIBLE', 'AUDIO', 'AUTHOR', 'AUTO', 'AUTOS', 'AVIANCA', 'AW',
    'AWS', 'AX', 'AXA', 'AZ', 'AZURE', 'BA', 'BABY', 'BAIDU', 'BAND',
    'BANK', 'BAR', 'BARCELONA', 'BARCLAYCARD', 'BARCLAYS', 'BAREFOOT',
    'BARGAINS', 'BAUHAUS', 'BAYERN', 'BB', 'BBC', 'BBVA', 'BCG', 'BCN',
    'BD', 'BE', 'BEATS', 'BEER', 'BENTLEY', 'BERLIN', 'BEST', 'BET', 'BF',
    'BG', 'BH', 'BHARTI', 'BI', 'BIBLE', 'BID', 'BIKE', 'BING', 'BINGO',
    'BIO', 'BIZ', 'BJ', 'BLACK', 'BLACKFRIDAY', 'BLOG', 'BLOOMBERG',
    'BLUE', 'BM', 'BMS', 'BMW', 'BN', 'BNL', 'BNPPARIBAS', 'BO', 'BOATS',
    'BOEHRINGER', 'BOM', 'BOND', 'BOO', 'BOOK', 'BOOTS', 'BOSCH', 'BOSTIK',
    'BOT', 'BOUTIQUE', 'BR', 'BRADESCO', 'BRIDGESTONE', 'BROADWAY',
    'BROKER', 'BROTHER', 'BRUSSELS', 'BS', 'BT', 'BUDAPEST', 'BUGATTI',
    'BUILD', 'BUILDERS', 'BUSINESS', 'BUY', 'BUZZ', 'BV', 'BW', 'BY', 'BZ',
    'BZH', 'CA', 'CAB', 'CAFE', 'CAL', 'CALL', 'CAMERA', 'CAMP',
    'CANCERRESEARCH', 'CANON', 'CAPETOWN', 'CAPITAL', 'CAR', 'CARAVAN',
    'CARDS', 'CARE', 'CAREER', 'CAREERS', 'CARS', 'CARTIER', 'CASA',
    'CASH', 'CASINO', 'CAT', 'CATERING', 'CBA', 'CBN', 'CC', 'CD', 'CEB',
    'CENTER', 'CEO', 'CERN', 'CF', 'CFA', 'CFD', 'CG', 'CH', 'CHANEL',
    'CHANNEL', 'CHASE', 'CHAT', 'CHEAP', 'CHINTAI', 'CHLOE', 'CHRISTMAS',
    'CHROME', 'CHURCH', 'CI', 'CIPRIANI', 'CIRCLE', 'CISCO', 'CITIC',
    'CITY', 'CITYEATS', 'CK', 'CL', 'CLAIMS', 'CLEANING', 'CLICK',
    'CLINIC', 'CLINIQUE', 'CLOTHING', 'CLOUD', 'CLUB', 'CLUBMED', 'CM',
    'CN', 'CO', 'COACH', 'CODES', 'COFFEE', 'COLLEGE', 'COLOGNE', 'COM',
    'COMMBANK', 'COMMUNITY', 'COMPANY', 'COMPARE', 'COMPUTER', 'COMSEC',
    'CONDOS', 'CONSTRUCTION', 'CONSULTING', 'CONTACT', 'CONTRACTORS',
    'COOKING', 'COOL', 'COOP', 'CORSICA', 'COUNTRY', 'COUPON', 'COUPONS',
    'COURSES', 'CR', 'CREDIT', 'CREDITCARD', 'CREDITUNION', 'CRICKET',
    'CROWN', 'CRS', 'CRUISES', 'CSC', 'CU', 'CUISINELLA', 'CV', 'CW',
    'CX', 'CY', 'CYMRU', 'CYOU', 'CZ', 'DABUR', 'DAD', 'DANCE', 'DATE',
    'DATING', 'DATSUN', 'DAY', 'DCLK', 'DDS', 'DE', 'DEAL', 'DEALER',
    'DEALS', 'DEGREE', 'DELIVERY', 'DELL', 'DELOITTE', 'DELTA', 'DEMOCRAT',
    'DENTAL', 'DENTIST', 'DESI', 'DESIGN', 'DEV', 'DHL', 'DIAMONDS',
    'DIET', 'DIGITAL', 'DIRECT', 'DIRECTORY', 'DISCOUNT', 'DJ', 'DK',
    'DM', 'DNP', 'DO', 'DOCS', 'DOG', 'DOHA', 'DOMAINS', 'DOT', 'DOWNLOAD',
    'DRIVE', 'DTV', 'DUBAI', 'DUNLOP', 'DUPONT', 'DURBAN', 'DVAG', 'DZ',
    'EARTH', 'EAT', 'EC', 'EDEKA', 'EDU', 'EDUCATION', 'EE', 'EG', 'EMAIL',
    'EMERCK', 'ENERGY', 'ENGINEER', 'ENGINEERING', 'ENTERPRISES', 'EPOST',
    'EPSON', 'EQUIPMENT', 'ER', 'ERICSSON', 'ERNI', 'ES', 'ESQ', 'ESTATE',
    'ET', 'EU', 'EUROVISION', 'EUS', 'EVENTS', 'EVERBANK', 'EXCHANGE',
    'EXPERT', 'EXPOSED', 'EXPRESS', 'EXTRASPACE', 'FAGE', 'FAIL',
    'FAIRWINDS', 'FAITH', 'FAMILY', 'FAN', 'FANS', 'FARM', 'FASHION',
    'FAST', 'FEEDBACK', 'FERRERO', 'FI', 'FILM', 'FINAL', 'FINANCE',
    'FINANCIAL', 'FIRE', 'FIRESTONE', 'FIRMDALE', 'FISH', 'FISHING', 'FIT',
    'FITNESS', 'FJ', 'FK', 'FLICKR', 'FLIGHTS', 'FLIR', 'FLORIST',
    'FLOWERS', 'FLSMIDTH', 'FLY', 'FM', 'FO', 'FOO', 'FOOTBALL', 'FORD',
    'FOREX', 'FORSALE', 'FORUM', 'FOUNDATION', 'FOX', 'FR', 'FRESENIUS',
    'FRL', 'FROGANS', 'FRONTIER', 'FTR', 'FUND', 'FURNITURE', 'FUTBOL',
    'FYI', 'GA', 'GAL', 'GALLERY', 'GALLO', 'GALLUP', 'GAME', 'GAMES',
    'GARDEN', 'GB', 'GBIZ', 'GD', 'GDN', 'GE', 'GEA', 'GENT', 'GENTING',
    'GF', 'GG', 'GGEE', 'GH', 'GI', 'GIFT', 'GIFTS', 'GIVES', 'GIVING',
    'GL', 'GLASS', 'GLE', 'GLOBAL', 'GLOBO', 'GM', 'GMAIL', 'GMBH', 'GMO',
    'GMX', 'GN', 'GOLD', 'GOLDPOINT', 'GOLF', 'GOO', 'GOODYEAR', 'GOOG',
    'GOOGLE', 'GOP', 'GOT', 'GOV', 'GP', 'GQ', 'GR', 'GRAINGER',
    'GRAPHICS', 'GRATIS', 'GREEN', 'GRIPE', 'GROUP', 'GS', 'GT', 'GU',
    'GUARDIAN', 'GUCCI', 'GUGE', 'GUIDE', 'GUITARS', 'GURU', 'GW', 'GY',
    'HAMBURG', 'HANGOUT', 'HAUS', 'HDFCBANK', 'HEALTH', 'HEALTHCARE',
    'HELP', 'HELSINKI', 'HERE', 'HERMES', 'HIPHOP', 'HISAMITSU', 'HITACHI',
    'HIV', 'HK', 'HKT', 'HM', 'HN', 'HOCKEY', 'HOLDINGS', 'HOLIDAY',
    'HOMEDEPOT', 'HOMES', 'HONDA', 'HORSE', 'HOST', 'HOSTING', 'HOTELES',
    'HOTMAIL', 'HOUSE', 'HOW', 'HR', 'HSBC', 'HT', 'HTC', 'HU', 'HYUNDAI',
    'IBM', 'ICBC', 'ICE', 'ICU', 'ID', 'IE', 'IFM', 'IINET', 'IL', 'IM',
    'IMAMAT', 'IMDB', 'IMMO', 'IMMOBILIEN', 'IN', 'INDUSTRIES', 'INFINITI',
    'INFO', 'ING', 'INK', 'INSTITUTE', 'INSURANCE', 'INSURE', 'INT',
    'INTERNATIONAL', 'INVESTMENTS', 'IO', 'IPIRANGA', 'IQ', 'IR', 'IRISH',
    'IS', 'ISELECT', 'ISMAILI', 'IST', 'ISTANBUL', 'IT', 'ITAU', 'IWC',
    'JAGUAR', 'JAVA', 'JCB', 'JCP', 'JE', 'JETZT', 'JEWELRY', 'JLC',
    'JLL', 'JM', 'JMP', 'JNJ', 'JO', 'JOBS', 'JOBURG', 'JOT', 'JOY',
    'JP', 'JPMORGAN', 'JPRS', 'JUEGOS', 'KAUFEN', 'KDDI', 'KE',
    'KERRYHOTELS', 'KERRYLOGISTICS', 'KERRYPROPERTIES', 'KFH', 'KG',
    'KH', 'KI', 'KIA', 'KIM', 'KINDER', 'KINDLE', 'KITCHEN', 'KIWI',
    'KM', 'KN', 'KOELN', 'KOMATSU', 'KOSHER', 'KP', 'KPMG', 'KPN',
    'KR', 'KRD', 'KRED', 'KUOKGROUP', 'KW', 'KY', 'KYOTO', 'KZ', 'LA',
    'LACAIXA', 'LAMBORGHINI', 'LAMER', 'LANCASTER', 'LAND', 'LANDROVER',
    'LANXESS', 'LASALLE', 'LAT', 'LATROBE', 'LAW', 'LAWYER', 'LB', 'LC',
    'LDS', 'LEASE', 'LECLERC', 'LEGAL', 'LEXUS', 'LGBT', 'LI', 'LIAISON',
    'LIDL', 'LIFE', 'LIFEINSURANCE', 'LIFESTYLE', 'LIGHTING', 'LIKE',
    'LIMITED', 'LIMO', 'LINCOLN', 'LINDE', 'LINK', 'LIPSY', 'LIVE',
    'LIVING', 'LIXIL', 'LK', 'LOAN', 'LOANS', 'LOCKER', 'LOCUS', 'LOL',
    'LONDON', 'LOTTE', 'LOTTO', 'LOVE', 'LR', 'LS', 'LT', 'LTD', 'LTDA',
    'LU', 'LUPIN', 'LUXE', 'LUXURY', 'LV', 'LY', 'MA', 'MADRID', 'MAIF',
    'MAISON', 'MAKEUP', 'MAN', 'MANAGEMENT', 'MANGO', 'MARKET',
    'MARKETING', 'MARKETS', 'MARRIOTT', 'MATTEL', 'MBA', 'MC', 'MD', 'ME',
    'MED', 'MEDIA', 'MEET', 'MELBOURNE', 'MEME', 'MEMORIAL', 'MEN', 'MENU',
    'MEO', 'METLIFE', 'MG', 'MH', 'MIAMI', 'MICROSOFT', 'MIL', 'MINI',
    'MK', 'ML', 'MLB', 'MLS', 'MM', 'MMA', 'MN', 'MO', 'MOBI', 'MOBILY',
    'MODA', 'MOE', 'MOI', 'MOM', 'MONASH', 'MONEY', 'MONTBLANC', 'MORMON',
    'MORTGAGE', 'MOSCOW', 'MOTORCYCLES', 'MOV', 'MOVIE', 'MOVISTAR',
    'MP', 'MQ', 'MR', 'MS', 'MT', 'MTN', 'MTPC', 'MTR', 'MU', 'MUSEUM',
    'MUTUAL', 'MUTUELLE', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NADEX',
    'NAGOYA', 'NAME', 'NATURA', 'NAVY', 'NC', 'NE', 'NEC', 'NET',
    'NETBANK', 'NETFLIX', 'NETWORK', 'NEUSTAR', 'NEW', 'NEWS', 'NEXT',
    'NEXTDIRECT', 'NEXUS', 'NF', 'NG', 'NGO', 'NHK', 'NI', 'NICO', 'NIKON',
    'NINJA', 'NISSAN', 'NISSAY', 'NL', 'NO', 'NOKIA', 'NORTHWESTERNMUTUAL',
    'NORTON', 'NOW', 'NOWRUZ', 'NOWTV', 'NP', 'NR', 'NRA', 'NRW', 'NTT',
    'NU', 'NYC', 'NZ', 'OBI', 'OFFICE', 'OKINAWA', 'OLAYAN', 'OLAYANGROUP',
    'OLLO', 'OM', 'OMEGA', 'ONE', 'ONG', 'ONL', 'ONLINE', 'OOO', 'ORACLE',
    'ORANGE', 'ORG', 'ORGANIC', 'ORIGINS', 'OSAKA', 'OTSUKA', 'OTT', 'OVH',
    'PA', 'PAGE', 'PAMPEREDCHEF', 'PANERAI', 'PARIS', 'PARS', 'PARTNERS',
    'PARTS', 'PARTY', 'PASSAGENS', 'PCCW', 'PE', 'PET', 'PF', 'PG', 'PH',
    'PHARMACY', 'PHILIPS', 'PHOTO', 'PHOTOGRAPHY', 'PHOTOS', 'PHYSIO',
    'PIAGET', 'PICS', 'PICTET', 'PICTURES', 'PID', 'PIN', 'PING', 'PINK',
    'PIONEER', 'PIZZA', 'PK', 'PL', 'PLACE', 'PLAY', 'PLAYSTATION',
    'PLUMBING', 'PLUS', 'PM', 'PN', 'POHL', 'POKER', 'PORN', 'POST',
    'PR', 'PRAXI', 'PRESS', 'PRIME', 'PRO', 'PROD', 'PRODUCTIONS', 'PROF',
    'PROGRESSIVE', 'PROMO', 'PROPERTIES', 'PROPERTY', 'PROTECTION', 'PS',
    'PT', 'PUB', 'PW', 'PWC', 'PY', 'QA', 'QPON', 'QUEBEC', 'QUEST',
    'RACING', 'RE', 'READ', 'REALESTATE', 'REALTOR', 'REALTY', 'RECIPES',
    'RED', 'REDSTONE', 'REDUMBRELLA', 'REHAB', 'REISE', 'REISEN', 'REIT',
    'REN', 'RENT', 'RENTALS', 'REPAIR', 'REPORT', 'REPUBLICAN', 'REST',
    'RESTAURANT', 'REVIEW', 'REVIEWS', 'REXROTH', 'RICH', 'RICHARDLI',
    'RICOH', 'RIO', 'RIP', 'RO', 'ROCHER', 'ROCKS', 'RODEO', 'ROOM',
    'RS', 'RSVP', 'RU', 'RUHR', 'RUN', 'RW', 'RWE', 'RYUKYU', 'SA',
    'SAARLAND', 'SAFE', 'SAFETY', 'SAKURA', 'SALE', 'SALON',
    'SAMSUNG', 'SANDVIK', 'SANDVIKCOROMANT', 'SANOFI', 'SAP', 'SAPO',
    'SARL', 'SAS', 'SAVE', 'SAXO', 'SB', 'SBI', 'SBS', 'SC', 'SCA', 'SCB',
    'SCHAEFFLER', 'SCHMIDT', 'SCHOLARSHIPS', 'SCHOOL', 'SCHULE', 'SCHWARZ',
    'SCIENCE', 'SCOR', 'SCOT', 'SD', 'SE', 'SEAT', 'SECURITY', 'SEEK',
    'SELECT', 'SENER', 'SERVICES', 'SEVEN', 'SEW', 'SEX', 'SEXY', 'SFR',
    'SG', 'SH', 'SHARP', 'SHAW', 'SHELL', 'SHIA', 'SHIKSHA', 'SHOES',
    'SHOP', 'SHOUJI', 'SHOW', 'SHRIRAM', 'SI', 'SILK', 'SINA', 'SINGLES',
    'SITE', 'SJ', 'SK', 'SKI', 'SKIN', 'SKY', 'SKYPE', 'SL', 'SM', 'SMILE',
    'SN', 'SNCF', 'SO', 'SOCCER', 'SOCIAL', 'SOFTBANK', 'SOFTWARE', 'SOHU',
    'SOLAR', 'SOLUTIONS', 'SONG', 'SONY', 'SOY', 'SPACE', 'SPIEGEL',
    'SPOT', 'SPREADBETTING', 'SR', 'SRL', 'ST', 'STADA', 'STAR', 'STARHUB',
    'STATEBANK', 'STATEFARM', 'STATOIL', 'STC', 'STCGROUP', 'STOCKHOLM',
    'STORAGE', 'STORE', 'STREAM', 'STUDIO', 'STUDY', 'STYLE', 'SU',
    'SUCKS', 'SUPPLIES', 'SUPPLY', 'SUPPORT', 'SURF', 'SURGERY', 'SUZUKI',
    'SV', 'SWATCH', 'SWISS', 'SX', 'SY', 'SYDNEY', 'SYMANTEC', 'SYSTEMS',
    'SZ', 'TAB', 'TAIPEI', 'TALK', 'TAOBAO', 'TATAMOTORS', 'TATAR',
    'TATTOO', 'TAX', 'TAXI', 'TC', 'TCI', 'TD', 'TDK', 'TEAM', 'TECH',
    'TECHNOLOGY', 'TEL', 'TELECITY', 'TELEFONICA', 'TEMASEK', 'TENNIS',
    'TEVA', 'TF', 'TG', 'TH', 'THD', 'THEATER', 'THEATRE', 'TICKETS',
    'TIENDA', 'TIFFANY', 'TIPS', 'TIRES', 'TIROL', 'TJ', 'TK', 'TL', 'TM',
    'TMALL', 'TN', 'TO', 'TODAY', 'TOKYO', 'TOOLS', 'TOP', 'TORAY',
    'TOSHIBA', 'TOTAL', 'TOURS', 'TOWN', 'TOYOTA', 'TOYS', 'TR', 'TRADE',
    'TRADING', 'TRAINING', 'TRAVEL', 'TRAVELERS', 'TRAVELERSINSURANCE',
    'TRUST', 'TRV', 'TT', 'TUBE', 'TUI', 'TUNES', 'TUSHU', 'TV', 'TVS',
    'TW', 'TZ', 'UA', 'UBS', 'UG', 'UK', 'UNICOM', 'UNIVERSITY', 'UNO',
    'UOL', 'UPS', 'US', 'UY', 'UZ', 'VA', 'VACATIONS', 'VANA', 'VC', 'VE',
    'VEGAS', 'VENTURES', 'VERISIGN', 'VERSICHERUNG', 'VET', 'VG', 'VI',
    'VIAJES', 'VIDEO', 'VIG', 'VIKING', 'VILLAS', 'VIN', 'VIP', 'VIRGIN',
    'VISION', 'VISTA', 'VISTAPRINT', 'VIVA', 'VLAANDEREN', 'VN', 'VODKA',
    'VOLKSWAGEN', 'VOTE', 'VOTING', 'VOTO', 'VOYAGE', 'VU', 'VUELOS',
    'WALES', 'WALTER', 'WANG', 'WANGGOU', 'WARMAN', 'WATCH', 'WATCHES',
    'WEATHER', 'WEATHERCHANNEL', 'WEBCAM', 'WEBER', 'WEBSITE', 'WED',
    'WEDDING', 'WEIBO', 'WEIR', 'WF', 'WHOSWHO', 'WIEN', 'WIKI',
    'WILLIAMHILL', 'WIN', 'WINDOWS', 'WINE', 'WME', 'WOLTERSKLUWER',
    'WORK', 'WORKS', 'WORLD', 'WS', 'WTC', 'WTF', 'XBOX', 'XEROX',
    'XIHUAN', 'XIN', 'XN--11B4C3D', 'XN--1CK2E1B', 'XN--1QQW23A',
    'XN--30RR7Y', 'XN--3BST00M', 'XN--3DS443G', 'XN--3E0B707E',
    'XN--3PXU8K', 'XN--42C2D9A', 'XN--45BRJ9C', 'XN--45Q11C', 'XN--4GBRIM',
    'XN--55QW42G', 'XN--55QX5D', 'XN--5TZM5G', 'XN--6FRZ82G',
    'XN--6QQ986B3XL', 'XN--80ADXHKS', 'XN--80AO21A', 'XN--80ASEHDB',
    'XN--80ASWG', 'XN--8Y0A063A', 'XN--90A3AC', 'XN--90AIS', 'XN--9DBQ2A',
    'XN--9ET52U', 'XN--9KRT00A', 'XN--B4W605FERD', 'XN--BCK1B9A5DRE4C',
    'XN--C1AVG', 'XN--C2BR7G', 'XN--CCK2B3B', 'XN--CG4BKI',
    'XN--CLCHC0EA0B2G2A9GCD', 'XN--CZR694B', 'XN--CZRS0T', 'XN--CZRU2D',
    'XN--D1ACJ3B', 'XN--D1ALF', 'XN--E1A4C', 'XN--ECKVDTC9D',
    'XN--EFVY88H', 'XN--ESTV75G', 'XN--FCT429K', 'XN--FHBEI',
    'XN--FIQ228C5HS', 'XN--FIQ64B', 'XN--FIQS8S', 'XN--FIQZ9S',
    'XN--FJQ720A', 'XN--FLW351E', 'XN--FPCRJ9C3D', 'XN--FZC2C9E2C',
    'XN--FZYS8D69UVGM', 'XN--G2XX48C', 'XN--GCKR3F0F', 'XN--GECRJ9C',
    'XN--H2BRJ9C', 'XN--HXT814E', 'XN--I1B6B1A6A2E', 'XN--IMR513N',
    'XN--IO0A7I', 'XN--J1AEF', 'XN--J1AMH', 'XN--J6W193G',
    'XN--JLQ61U9W7B', 'XN--JVR189M', 'XN--KCRX77D1X4A', 'XN--KPRW13D',
    'XN--KPRY57D', 'XN--KPU716F', 'XN--KPUT3I', 'XN--L1ACC',
    'XN--LGBBAT1AD8J', 'XN--MGB9AWBF', 'XN--MGBA3A3EJT', 'XN--MGBA3A4F16A',
    'XN--MGBA7C0BBN0A', 'XN--MGBAAM7A8H', 'XN--MGBAB2BD', 'XN--MGBAYH7GPA',
    'XN--MGBB9FBPOB', 'XN--MGBBH1A71E', 'XN--MGBC0A9AZCG',
    'XN--MGBCA7DZDO', 'XN--MGBERP4A5D4AR', 'XN--MGBPL2FH', 'XN--MGBT3DHD',
    'XN--MGBTX2B', 'XN--MGBX4CD0AB', 'XN--MIX891F', 'XN--MK1BU44C',
    'XN--MXTQ1M', 'XN--NGBC5AZD', 'XN--NGBE9E0A', 'XN--NODE', 'XN--NQV7F',
    'XN--NQV7FS00EMA', 'XN--NYQY26A', 'XN--O3CW4H', 'XN--OGBPF8FL',
    'XN--P1ACF', 'XN--P1AI', 'XN--PBT977C', 'XN--PGBS0DH', 'XN--PSSY2U',
    'XN--Q9JYB4C', 'XN--QCKA1PMC', 'XN--QXAM', 'XN--RHQV96G',
    'XN--ROVU88B', 'XN--S9BRJ9C', 'XN--SES554G', 'XN--T60B56A',
    'XN--TCKWE', 'XN--UNUP4Y', 'XN--VERMGENSBERATER-CTB',
    'XN--VERMGENSBERATUNG-PWB', 'XN--VHQUV', 'XN--VUQ861B',
    'XN--W4R85EL8FHU5DNRA', 'XN--W4RS40L', 'XN--WGBH1C', 'XN--WGBL6A',
    'XN--XHQ521B', 'XN--XKC2AL3HYE2A', 'XN--XKC2DL3A5EE0H', 'XN--Y9A3AQ',
    'XN--YFRO4I67O', 'XN--YGBI2AMMX', 'XN--ZFR164B', 'XPERIA', 'XXX',
    'XYZ', 'YACHTS', 'YAHOO', 'YAMAXUN', 'YANDEX', 'YE', 'YODOBASHI',
    'YOGA', 'YOKOHAMA', 'YOU', 'YOUTUBE', 'YT', 'YUN', 'ZA', 'ZAPPOS',
    'ZARA', 'ZERO', 'ZIP', 'ZM', 'ZONE', 'ZUERICH', 'ZW'
]));
