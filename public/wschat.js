(function($) {
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
        lastKnownMessage = -1,
        localStorage = window.localStorage;
    
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
    }).focus();
    
    chatMessages.on('wheel', function(event) {
        event.preventDefault();
        
        var oe = event.originalEvent,
            delta = oe.deltaY,
            scroll = chatMessages.scrollTop(),
            dist = 60;
        
        chatMessages.scrollTop(scroll -
            Math.sign(delta) * dist);
    }).on('keydown', function(event) {
        var dist,
            pageHeight = chatMessages.innerHeight(),
            lineHeight = 24,
            panWidth = 24,
            scroll,
            dist = { x: 0, y: 0 };
        scrollTop = chatMessages.scrollTop();
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
        return later;
        
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
        while (match = regex.exec(input))
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
            part,
            links, linkText, linkUrl;
        chatMessage.attr({
            'data-messageid': data.id,
            'data-timestamp': data.timestamp
        });
        chatSender.text(data.sender);
        /*
        input = data.message;
        codeFragments = reverseMatches(/(`+)(.*?)\1/g, input);
        
        lastEnd = 0;
        parts = codeFragments.reduce(function(parts, match) {
            var index = match.index,
                length = match[0].length,
                code = match[2];
            
            if (index > lastEnd) {
                parts.push(match.input.substr(lastEnd, index));
            } else {
                parts.push($('<span/>', {
                    'class': 'chat-message-code',
                    text: code
                }));
            }
            lastEnd = index + length;
        }, []);
        if (lastEnd < input.length)
            parts.push(input.substr(lastEnd));
        
        // Now parts is an array of elements that might be
        //  string: for unescaped fragment, and
        //  jQuery: span element generated from code
        
        for (i = parts.length-1; i >= 0; --i) {
            part = parts[i];
            if (typeof part !== 'string')
                continue;
            
            links = reverseMatches(/\[.*?\]\(\S+\)/g, part);
            links.forEach(function(match) {
                var index = match.index,
                    length = match[0].length,
                    linkText = match[1],
                    linkUrl = match[2];
                
            });
        }
        */
        chatText.text(data.message);
        
        return chatMessage.clone();
    }
    
    // Infinite get request, never resolves,
    // endlessly gets more messages
    // but might reject
    function update(lastKnownMessage, backoff) {
        return $.getJSON({
            url: '/api/wschat/message/stream',
            data: {
                since: lastKnownMessage,
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
}(jQuery));
