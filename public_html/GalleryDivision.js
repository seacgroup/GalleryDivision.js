/* 
 * The MIT Modified License (MIT, Erich Horn)
 * Copyright (c) 2012, 2013 Erich
 *
 * Author Erich
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to 
 * deal in the Software without restriction, including without limitation the 
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
 * sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice, author and this permission notice shall be 
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
 * IN THE SOFTWARE.
 */

var InitTest = ( function ( ) {
    var GroupSize = 1,
        GroupMod = Math.pow( 10, GroupSize ),
        PX = 'px',
        ArrayProto = Array.prototype,
        ArraySlice = ArrayProto.slice,
        ArraySplice = ArrayProto.splice,
        _GetInRange = function ( array, index, start, end ) {
            return ( index < start || index >= end ) ? null : array[index];
        },
        _AdjustIndex = function ( index, start, length, nullValue ) { 
            if ( index == null )
                return nullValue;
            if ( index < 0 )
                return length + index;
            return index;
        },
        _HasClass = function ( element, className, requireAll ) {
            var re = new RegExp( '(\\s+|^)(' + className.trim( ).split( /\s+/ ).join( '|' ) + ')(?!\\w)', 'ig' ),
                many = [ ],
                n = 0,
                c = 0;
            
            if ( ! element )
                return element;
            if ( element.length != null )
                n = ( many = element ).length;
            else if ( typeof element == 'string' || element instanceof String )
                n = ( many = document.body.querySelectorAll( element ) ).length;
            else if ( element )
                many = [ element ], n = 1;
            
            while ( n-- > 0 ) {
                if ( ( element = many[n].className )
                        && re.test( element.className ) )
                    c++;
            }
            
            if ( requireAll )
                return c === many.length;
            
            return c;
        },
        _ToggleClass = function ( element, className, add ) {
            var re = new RegExp( '(\\s+|^)(' + ( className = className.trim( ) ).split( /\s+/ ).join( '|' ) + ')(?!\\w)', 'ig' ),
                many = [ ],
                n = 0,
                c = 0,
                classes;
            
            if ( ! element )
                return element;
            if ( element.length != null )
                n = ( many = element ).length;
            else if ( typeof element == 'string' || element instanceof String )
                n = ( many = document.body.querySelectorAll( element ) ).length;
            else if ( element )
                many = [ element ], n = 1;
            
            while ( n-- > 0 ) {
                classes = ( element = many[n] ).className;
                if ( add || ( add == null && ! re.test( classes ) ) )
                    element.className = classes.replace( re, '' ) + ' ' + className, c++;
                else
                    element.className = classes.replace( re, '' );
            }
            
            return c;
        },
        _ClearFocus = function ( container ) {
            return _ToggleClass( container.querySelectorAll( '.focus' ), 'focus', false );
        },
        _CleanNumberStringRegExp = /^\s*([\+\-]?)\s*0*([1-9]\d*|0)\s*$/,
        _CleanNumberString = function ( numberString ) {
            var match = _CleanNumberStringRegExp.exec(numberString);
            if ( match ) {
                if ( match[2] === '0' )
                    return match[2];
                return match[1] + match[2];
            }
            throw numberString + " is an invalid numberString";
        },
        _SplitNumberString = function ( numberString, groupSize ) {
            numberString = _CleanNumberString( numberString );
            var l = numberString.length,
                result = [ ];
            while ( l > groupSize )
                result.push( parseInt( numberString.substr( l -= groupSize, groupSize ) ) );
            result.push( parseInt( numberString.substr( 0, l ) ) );
            return result;
        },
        _SplitAny = function ( value ) {
            if ( value == null )
                return [ ];
            else if ( value instanceof _GroupManager )
                return value.groups.slice( );
            else if ( ! ( value instanceof Array ) )
                return _SplitNumberString( value.toString( ), GroupSize );
            return value;
        },
        _GroupManager = function ( container, value, start, end ) {
            this.container = container || document.createElement( 'math' );
            this.groupContainers = ArraySlice.call( this.container.children ).reverse( );
            this.groups = _SplitAny( value );
            start = _AdjustIndex( start, 0, this.groups.length, 0 );
            end = _AdjustIndex( end, 0, this.groups.length + 1, this.groups.length );
            var index = end,
                snapshotStack = [ ];
            snapshotStack.current = -1;
            this.__defineGetter__( 'length', function ( ) { return this.groups.length; } );
            this.__defineGetter__( 'index', function ( ) { return index; } );
            this.__defineSetter__( 'index', function ( i ) { index = _AdjustIndex( i, start, end, end ); } );
            this.__defineGetter__( 'start', function ( ) { return start; } );
            this.__defineSetter__( 'start', function ( i ) { start = _AdjustIndex( i, 0, this.groups.length, 0 ); } );
            this.__defineGetter__( 'end', function ( ) { return end; } );
            this.__defineSetter__( 'end', function ( i ) { end = _AdjustIndex( i, 0, this.groups.length, this.groups.length ); } );
            this.__defineGetter__( 'group', function ( ) {
                if ( index >= start && index < end )
                    return this.groups[index] || 0;
                return null;
            } );
            this.__defineSetter__( 'group', function ( group ) {
                this.groups[index] = group;
                if ( end <= index )
                    end = index + 1;
            } );
            this.__defineGetter__( 'prevGroup', function ( ) {
                if ( index >= start + 1 && index < end + 1 )
                    return this.groups[--index] || 0;
                return null;
            } );
            this.__defineSetter__( 'prevGroup', function ( group ) {
                if ( index > 0 ) {
                    this.groups[--index] = group;
                    if ( end <= index )
                        end = index + 1;
                }
            } );
            this.__defineGetter__( 'groupNext', function ( ) {
                if ( index >= start - 1 && index < end - 1 )
                    return this.groups[index++] || 0;
                return null;
            } );
            this.__defineSetter__( 'groupNext', function ( group ) {
                this.groups[index] = group;
                if ( end <= ++index )
                    end = index;
            } );
            this.groupAtOffset = function ( offset, group ) {
                offset += index;
                if ( arguments.length < 2 ) {
                    if ( offset >= start && offset < end )
                        return this.groups[offset] || 0;
                    return null;
                }
                
                this.groups[offset] = group;
                if ( end <= offset )
                    end = offset + 1;
                return this;
            };
            this.groupAt = function ( i, group ) {
                if ( arguments.length < 2 ) {
                    if ( i >= start && i < end )
                        return this.groups[i] || 0;
                    return null;
                }
                
                this.groups[i] = group;
                if ( end <= i )
                    end = i + 1;
                return this;
            };
            this.__defineGetter__( 'value', function ( ) { return this.valueOf( 0 ); } );
            this.__defineSetter__( 'value', function ( value ) { this.valueOf( start = 0, value ); } );
            this.clearGroups = function ( from, to ) {
                var container = this.container,
                    groupContainers = this.groupContainers;
                if ( arguments.length === 0 ) {
                    while ( container.lastChild )
                        container.removeChild( container.lastChild );
                    groupContainers.splice( 0 );
                } else {
                    var i = _AdjustIndex( from, 0, groups.length, start );
                    to = _AdjustIndex( to, 0, groups.length + 1, end );
                    while ( i < to ) { // remember index 0 is at the last container
                        if ( groupContainers[i] )
                            container.removeChild( groupContainers[i] );
                        groupContainers[i++] = null;
                    }
                    groupContainers.splice( from, to - from );
                }
                return this;
            };
            this.renderGroups = function ( from, to ) {
                var container = this.container,
                    groupContainers = this.groupContainers,
                    groups = this.groups,
                    element, el, i, j;
                
                from = _AdjustIndex( from, 0, groups.length, start );
                to = _AdjustIndex( to, 0, groups.length + 1, end );
                for ( i = from; i < to; i++ ) {
                    // remember index 0 is at the last container
                    if ( ! ( element = groupContainers[i] ) ) {
                        element = groupContainers[j = i] = document.createElement( 'span' );
                        // find element to insert before
                        while ( j-- > 0 && ! ( el = groupContainers[j] ) )
                            ;
                        if ( j >= 0 )
                            container.insertBefore( element, el );
                        else
                            container.appendChild( element );
                    }
                    if ( ( j = groups[i] ) == null ) {
                        element.innerText = '';
                        _ToggleClass( element, 'invalid', false );
                    } else {
                        element.innerText = j;
                        _ToggleClass( element, 'invalid', j < 0 );
                    }
                }
                return this;
            };
            this.render = function ( i ) {
                var container = this.container,
                    groupContainers = this.groupContainers,
                    groups = this.groups,
                    element = groupContainers[i || ( i = this.index )],
                    el, j;
                
                // remember index 0 is at the last container
                if ( ! element ) {
                    element = groupContainers[j = i] = document.createElement( 'span' );
                    // find element to insert before
                    while ( j-- > 0 && ! ( el = groupContainers[j] ) )
                        ;
                    if ( j >= 0 )
                        container.insertBefore( element, el );
                    else
                        container.appendChild( element );
                }
                element.innerText = ( j = groups[i] ) != null ? j : '';
                if ( j < 0 )
                    _ToggleClass( element, 'invalid', true );
                return this;
            };
            this.ClearSnapshots = function ( ) {
                snapshotStack = [ ];
                snapshotStack.current = -1;
                return this;
            };
            this.storeSnapshot = function ( remember ) {
                if ( remember )
                    snapshotStack.current = snapshotStack.length;
                snapshotStack.push( {
                    groups: this.groups.slice( ),
                    index: index,
                    start: start,
                    end: end
                } );
                return this;
            };
            this.restoreSnapshot = function ( snapshotIndex ) {
                var snapshot;
                
                snapshotIndex = _AdjustIndex( snapshotIndex, 0, snapshotStack.length, -1 );
                snapshot = snapshotStack.splice( snapshotIndex ).shift( );
                if ( ! snapshot )
                    return false;
                
                this.groups = snapshot.groups;
                index = snapshot.index;
                start = snapshot.start;
                end = snapshot.end;
                
                return this;
            };
            this.__defineGetter__( 'focus', function ( ) {
                var element = this.groupContainers[index];
                return _HasClass( element, 'focus' ) > 0
                    && ! _HasClass( element, 'cancelled' );
            } );
            this.__defineSetter__( 'focus', function ( add ) {
                var element = this.groupContainers[index];
                _ClearFocus( this.container );
                if ( ! _HasClass( element, 'cancelled' ) )
                    _ToggleClass( element, 'focus', add === null ? true : add );
            } );
            this.__defineGetter__( 'cancelled', function ( ) {
                var element = this.groupContainers[index];
                return _HasClass( element, 'cancelled' );
            } );
            this.__defineSetter__( 'cancelled', function ( add ) {
                var element = this.groupContainers[index];
                _ToggleClass( element, 'cancelled', add === null ? true : add );
            } );
            this.toString = function ( from, to ) {
                from = _AdjustIndex( from, 0, this.groups.length, 0 );
                to = _AdjustIndex( to, 0, this.groups.length + 1, this.groups.length );
                return this.groups.slice( from, to ).reduceRight( function ( pre, cur ) {
                    return cur == null ? ' ' + pre : cur + pre;
                }, '' );
            };
            this.valueOf = function ( from, value ) {
                from = _AdjustIndex( from, 0, this.groups.length, 0 );
                
                if ( arguments.length > 1 ) {
                    var i = 0;
                    value = _SplitAny( value );
                    if ( from + value.length > end )
                        end = from + value.length;
    //                this.groups.splice( end );
                    while ( from < end )
                        this.groups[from++] = value[i++];
                    return this;
                }
                
                return this.groups.slice( from ).reduceRight( function ( pre, cur ) {
                    return ( cur || 0 ) + pre * 10;
                }, 0 );
            };
        },
        calcState = 0, calcStack = [ ], calcStackMark = -1,
        dividend, divisor, quotient, remainder,
        testContainer, leftContainer, rightContainer, bottomContainer,
        dividendInput, divisorInput,
        renderButton, prevButton, nextButton,
        dividendManager, divisorManager, remainderManager, quotientManager,
        dividendChange = function ( ) { dividend = parseInt( dividendInput.value ); },
        divisorChange = function ( ) { divisor = parseInt( divisorInput.value ); },
        RestoreSnapshot = function ( snapshotIndex ) {
            snapshotIndex = _AdjustIndex( snapshotIndex, 0, calcStack.length, calcStack.length - 1 );
            if ( ( calcState = calcStack[snapshotIndex] )
                    && remainderManager.restoreSnapshot( snapshotIndex )
                    && quotientManager.restoreSnapshot( snapshotIndex )
                    && dividendManager.restoreSnapshot( snapshotIndex )
                    && divisorManager.restoreSnapshot( snapshotIndex ) ) {
                calcStack.splice( snapshotIndex );
                return true;
            }
            throw 'RestoreSnapshot: nothing to restore';
        },
        StoreSnapshot = function ( ) {
            calcStack.push( calcState );
            remainderManager.storeSnapshot( );
            quotientManager.storeSnapshot( );
            dividendManager.storeSnapshot( );
            divisorManager.storeSnapshot( );
            return calcStack.length;
        },
        PrevStep = function ( ) {
            // prev group
            if ( RestoreSnapshot( -1 ) ) {
                dividendManager.renderGroups( ).focus = true;
                remainderManager.renderGroups( ).focus = true;
                divisorManager.renderGroups( ).focus = true;
                quotientManager.renderGroups( ).focus = true;
                return true;
            }
            return false;
        },
        ModulusStep = function ( ) {
            StoreSnapshot( );
            
            if ( calcState == 3 ) {
                divisorManager.prevGroup;
                remainderManager.prevGroup;
                dividendManager.prevGroup;
            }
            
            var i = dividendManager.index,
                dsor = divisorManager.group,
                quot = quotientManager.group,
                drem = remainderManager.valueOf( i );
            
            if ( i < 0
                    || dsor == null
                    || quot == null
                    || remainderManager.group == null
                    || dividendManager.group == null )
                return false;
            
            if ( ( drem -= dsor * quot ) < 0 ) {
                // underflow
                remainderManager.group = drem;
                remainderManager.render( );
                RestoreSnapshot( calcStackMark );
                quotientManager.group--;
            } else {
                quotientManager.render( );
                remainderManager.valueOf( i, drem );
                remainderManager.renderGroups( i ).focus = true;
                dividendManager.cancelled = true;
                dividendManager.focus = true;
                divisorManager.focus = true;
                
                if ( divisorManager.index )
                    calcState = 3;
                else if ( remainderManager.index )
                    calcState = 1;
                else {
                    calcState = 4;
                    _ToggleClass( testContainer, 'done', true );
                    _ClearFocus( testContainer );
                }
            }
            
            return true;
        },
        QuotientStep = function ( ) {
            calcStackMark = StoreSnapshot( );
            
            divisorManager.index = -1;
            --remainderManager.start;
            --dividendManager.start;
            remainderManager.index = dividendManager.index = dividendManager.start + divisorManager.index;
            
            var i = dividendManager.index,
                dsor = divisorManager.group,
                quot = dsor ? Math.min( 9, Math.floor( remainderManager.valueOf( i ) / dsor ) ) : 0;
            
            if ( i < 0
                    || dsor == null
                    || remainderManager.group == null
                    || dividendManager.group == null )
                return false;
            
            quotientManager.groupAt( i, quot ).index = i;
            quotientManager.render( ).focus = true;
            remainderManager.focus = true;
            dividendManager.focus = true;
            divisorManager.focus = true;
            if ( divisorManager.index != remainderManager.start )
                divisorManager.container.insertBefore( document.createElement( 'span' ), divisorManager.container.firstChild );
            calcState = 2;
            
            return true;
        },
        InitStep = function ( ) {
            calcStack = [ ];
            divisorManager.ClearSnapshots( ).value = divisor;
            dividendManager.ClearSnapshots( ).value = dividend;
            remainder = dividend;
            quotientManager.ClearSnapshots( ).value = [ ];
            remainderManager.ClearSnapshots( ).value = dividendManager.groups.slice( );
            
            divisorManager.clearGroups( ).renderGroups( );
            dividendManager.clearGroups( ).renderGroups( );
            remainderManager.clearGroups( );
            quotientManager.clearGroups( );
            
            dividendManager.start = remainderManager.start = -divisorManager.end + 1;
            dividendManager.index = remainderManager.index = divisorManager.index = null;
            
            calcState = 1;
            return true;
        },
        renderClick = function ( ) {
            if ( calcState ) {
                testContainer.className = '';
                _ToggleClass( testContainer, 'render', false );
                _ToggleClass( testContainer, 'begin', false );
                renderButton.value = 'RENDER';
                calcState = 0;
            } else if ( InitStep( ) ) {
                _ToggleClass( testContainer, 'render', true );
                _ToggleClass( testContainer, 'begin', true );
                renderButton.value = 'RESET';
            }
        },
        prevClick = function ( ) {
            try {
                PrevStep( );
                _ToggleClass( testContainer, 'done', false );
            } catch ( e ) {
                _ToggleClass( testContainer, 'begin', true );
            }
        },
        nextClick = function ( ) {
            if ( calcState > 3 )
                return;
            switch ( calcState ) {
                case 1:
                    QuotientStep( );
                    break;
                case 2:
                case 3:
                    ModulusStep( );
                    break;
            }
            _ToggleClass( testContainer, 'begin', false );
        },
        InitTest = function ( ) {
            testContainer = document.body.querySelector( '#test' );
            leftContainer = testContainer.querySelector( '#left' );
            rightContainer = testContainer.querySelector( '#right' );
            bottomContainer = testContainer.querySelector( '#bottom' );
            dividendInput = leftContainer.querySelector( '#dividend' );
            divisorInput = leftContainer.querySelector( '#divisor' );
            renderButton = bottomContainer.querySelector( '#render' );
            prevButton = bottomContainer.querySelector( '#prev' );
            nextButton = bottomContainer.querySelector( '#next' );
            leftContainer.insertBefore( ( remainderManager = new _GroupManager ).container, dividendInput );
            leftContainer.insertBefore( ( dividendManager = new _GroupManager ).container, dividendInput );
            leftContainer.insertBefore( ( divisorManager = new _GroupManager ).container, divisorInput );
            rightContainer.appendChild( ( quotientManager = new _GroupManager ).container );
            
            var tds = testContainer.querySelectorAll( 'td' ),
                width = dividendInput.offsetWidth,
                height = dividendInput.offsetHeight,
                i = tds.length;
            while ( i-- > 0 ) {
                tds[i].style.width = ( tds[i].colSpan * ( width + 1 ) - 1 ) + PX;
                tds[i].style.height = ( 2 *height ) + PX;
            }
            
            dividendInput.addEventListener( 'change', dividendChange );
            dividendChange( );
            divisorInput.addEventListener( 'change', divisorChange );
            divisorChange( );
            
            renderButton.addEventListener( 'click', renderClick );
            prevButton.addEventListener( 'click', prevClick );
            nextButton.addEventListener( 'click', nextClick );
            
        };
    
    return InitTest;
} )( );
