$(document).ready(function(){
    let fileUploadDetails = {
        'fileName': undefined,
        'fileType': undefined,
        'uploadFile': undefined,
        'fileID':undefined,
    }

    let matchData = {};
    let finalResult = {};
    let flag = true;
    let betTypeList = ['HAD','HHA','HIL','FHL','CHL','FTS','HDC'];

    function createXML(xmlData){
        $.ajax({
            url: window.location.origin+'/peter/exe/createXML.php',
            type: 'POST',
            data: xmlData,
            datatype: 'text',
            success: function(data){
                console.log(data);

                if(data == "Success"){
                    $(".uploadTable tbody").append(`
                    <tr class='uploadButtonArea'>
                        <td><a href='${window.location.origin}/peter/exe/newxmlfile.xml' download><button class='downloadButton'>Download</button></a></td>
                    </tr>
                    `);
                }
            },
            error:function(e){
                console.log(JSON.stringify(e));
            },
        });
    }

    function getMatches(filesId){
        let d = {
            'filesId': filesId,
        };
        $.ajax({
            url: window.location.origin+'/peter/exe/getMatches.php',
            type: 'POST',
            data: d,
            datatype: 'JSON',
            success: function(data){
                data = JSON.parse(data);
                console.log(data);
// var byDate = $(data['success']).slice(0);
// byDate.sort(function(a,b) {
//     return a.match_no - b.match_no;
// });
// console.log(byDate);
                
                createXML(data);
            },
            error:function(e){
                console.log(JSON.stringify(e));
            },
        });
    }

    function matchesInsert(mi_data){
        $.ajax({
            url:window.location.origin+"/peter/exe/matchesinsert.php",
            type:"POST",
            data:mi_data,
            datatype:"JSON",
            success: function(data){
                //console.log(data);
                if(flag){
                    getMatches(mi_data['fileID']);
                    flag = false;
                }
            },
            error:function(e){
                console.log(JSON.stringify(e));
            },
        });
    }

    function extractOdds(odds, odds_type){
        console.log(odds);
        console.log(odds_type);
        let temp_concat = '';
        if(typeof odds == "undefined"){
            odds = JSON.stringify(odds);
            odds = odds.replace(/[^\d.,|/-]/g, '');
            odds_array = odds.split(",");

        }else {
                let temp_arr = new Array();
                $.each(odds, function(i,j){
                    j = JSON.stringify(j);
                    j = j.replace(/[^\d.,|/-]/g, '');
                    temp_arr.push(j);
                });

                console.log(temp_arr);

                $.each(temp_arr, function(i, j){
                    temp_concat += j+",";
                });
                console.log(temp_concat);
                odds_array = temp_concat.split(",");
        }

        return odds_array;
    }

    function leagueExt(mData, LaT){
        let L_Id = mData['matchLeagueId'];
        let awayTeamId = matchData['awayTeamId'];
        let homeTeamId = matchData['homeTeamId'];
        let leagueEngName = null;
        let leagueChiName = null;
        let teamHomeEngName = null;
        let teamAwayEngName = null;
        let teamHomeChiName = null;
        let teamAwayChiName = null;
        $(LaT).each(function(){
            if($(this).prop('tagName') == "ns2:League"){
                if($(this).attr("leagueID") == L_Id){
                    $(this).children().each(function(){
                        if($(this).attr('lang') == 'en-us'){
                            leagueEngName = $(this).text();
                        }else if($(this).attr('lang') == 'zh-hk'){
                            leagueChiName = $(this).text();
                        }
                    });
                }
            } 
            else if($(this).prop('tagName') == "ns2:Team"){
                if($(this).attr('teamID') == awayTeamId){
                    $(this).children().each(function(){
                        if($(this).attr('lang') == "en-us"){
                            teamAwayEngName = $(this).text();
                        }else if($(this).attr('lang') == "zh-hk"){
                            teamAwayChiName = $(this).text();
                        }
                    });
                }else if($(this).attr('teamID') == homeTeamId){
                    $(this).children().each(function(){
                        if($(this).attr('lang') == "en-us"){
                            teamHomeEngName = $(this).text();
                        }else if($(this).attr('lang') == "zh-hk"){
                            teamHomeChiName = $(this).text();
                        }
                    });
                }
            }

            if(leagueEngName && leagueChiName && teamAwayChiName && teamAwayEngName && teamHomeEngName && teamHomeChiName){
                finalResult['leagueEngName'] = leagueEngName;
                finalResult['leagueChiName'] = leagueChiName;
                finalResult['homeTeamEngName'] = teamHomeEngName;
                finalResult['awayTeamEngName'] = teamAwayEngName;
                finalResult['homeTeamChiName'] = teamHomeChiName;
                finalResult['awayTeamChiName'] = teamAwayChiName;
                finalResult['fileID'] = fileUploadDetails['fileID'];
                matchesInsert(finalResult);
console.log(finalResult);

                $("#table-indesign tr:last").after(`
            <tr>
                <td rowspan="2">${finalResult['matchNo']}</td>
                <td rowspan="2">${finalResult['matchTime']}</td>
                <td rowspan="2">${finalResult['leagueEngName']}</td>
                <td rowspan="2">${finalResult['homeTeamEngName']}</td>
                <td>${extractOdds(finalResult['odds']['HAD'])[2]}</td>
                <td>${extractOdds(finalResult['odds']['HAD'])[1]}</td>
                <td>${extractOdds(finalResult['odds']['HAD'])[0]}</td>
                <td rowspan="2">${finalResult['awayTeamEngName']}</td>
                <td></td>
                <td></td>
                <td></td>
                <td>${extractOdds(finalResult['odds']['HHA'])[3]}</td>
                <td>${extractOdds(finalResult['odds']['HHA'])[2]}</td>
                <td>${extractOdds(finalResult['odds']['HHA'])[1]}</td>
                <td></td>
                <td></td>
                <td>${extractOdds(finalResult['odds']['HIL'], "HIL")[5] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['HIL'], "HIL")[3] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['HIL'], "HIL")[4] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['HIL'], "HIL")[2] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['HIL'], "HIL")[0] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['HIL'], "HIL")[1] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['HIL'], "HIL")[8] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['HIL'], "HIL")[6] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['HIL'], "HIL")[7] || "N/A"}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>${extractOdds(finalResult['odds']['FHL'], 'FHL')[8] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['FHL'], 'FHL')[6] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['FHL'], 'FHL')[7] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['FHL'], 'FHL')[2] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['FHL'], 'FHL')[0] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['FHL'], 'FHL')[1] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['FHL'], 'FHL')[5] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['FHL'], 'FHL')[3] || "N/A"}</td>
                <td>${extractOdds(finalResult['odds']['FHL'], 'FHL')[4] || "N/A"}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>                
                `);

                $("#pop-result").append(`
                <p>${JSON.stringify(finalResult)}</p>
                <br>
                `);
                

                leagueChiName = null;
                leagueEngName = null;
                teamHomeEngName = null;
                teamAwayEngName = null;
                teamHomeChiName = null;
                teamAwayChiName = null;
            }
        });
    }

    function convertMatchTime(dateTime){
        let d = dateTime.replace(" ", "-");
        d = d.replace("/[^\d.-]/g", "-");
        let d_arr = d.split("-");
        let hours = parseInt(d_arr[3]);
        let d_matchtime = undefined;
        if(hours > 12){
            d_matchtime = (hours - 12)+":"+d_arr[4]+" Pm";
        }else{
            d_matchtime = hours+":"+d_arr[4]+" Am";
        }
        let d_result = d_arr[1]+"/"+d_arr[2]+" "+d_matchtime;

        return d_result;
    }
    
    function poolDetails(f_data, p_id,c_betType){
        let odds_h = {}, odds_l = {} ,odds_hl = {} ,odds_had = {} ,odds_hha = {},odds_fts = {}, odds_adhn = {}, odds_cha1 = {}, odds_h1 = {}, odds_a1 = {};
        let odds_hil, odds_fhl,odds_chl, odds_hdc;
        $(f_data).children().children().each(function(){
            if($(this).prop("tagName") == "ns2:GetConfOddsResponse"){
                $(this).children().each(function(){
                    if($(this).prop("tagName") == "ns2:FixedOddsPools"){
                        $(this).children().each(function(){
                            if($(this).prop("tagName") == "ns2:PoolOddsInfo"){
                                if($(this).attr("poolID") == p_id){
                                    $(this).children().each(function(){
                                        if(c_betType == "HAD" || c_betType == "HHA" || c_betType == "FTS"){

                                            if($(this).prop("tagName") == "ns2:LatestOdds" && $(this).attr('combStr') == "A"){
                                                if(c_betType == "HHA"){
                                                    let cond_hha = $(this).attr('condition');
                                                    switch(cond_hha){
                                                        case "+0.5":
                                                            odds_adhn['c'] = "受讓0.5";
                                                            break;
                                                        case "-0.5":
                                                            odds_adhn['c'] = "讓0.5";
                                                            break;
                                                        case "+1":
                                                            odds_adhn['c'] = "受讓1";
                                                            break;
                                                        case "-1":
                                                            odds_adhn['c'] = "讓1";
                                                            break;
                                                        case "+2":
                                                            odds_adhn['c'] = "受讓2";
                                                            break;
                                                        case "-2":
                                                            odds_adhn['c'] = "讓2";
                                                            break;
                                                        
                                                    }
                                                }
                                                $(this).children().each(function(){
                                                    if($(this).prop("tagName") == 'ns5:Odds'){
                                                        odds_adhn['a'] = $(this).text();
                                                    }
                                                });
                                            }else if($(this).prop("tagName") == "ns2:LatestOdds" && $(this).attr('combStr') == "H"){
                                                $(this).children().each(function(){
                                                    if($(this).prop("tagName") == 'ns5:Odds'){
                                                        odds_adhn['h'] = $(this).text();
                                                    }
                                                });
                                            }else if($(this).prop("tagName") == "ns2:LatestOdds" && $(this).attr('combStr') == "D"){
                                                $(this).children().each(function(){
                                                    if($(this).prop("tagName") == 'ns5:Odds'){
                                                        odds_adhn['d'] = $(this).text();
                                                    }
                                                });
                                            }else if($(this).prop("tagName") == "ns2:LatestOdds" && $(this).attr('combStr') == "N"){
                                                $(this).children().each(function(){
                                                    if($(this).prop("tagName") == 'ns5:Odds'){
                                                        odds_adhn['n'] = $(this).text();
                                                    }
                                                });
                                            }
                                        }else if(c_betType == "HIL" || c_betType == "FHL" || c_betType == "CHL"){
                                            if($(this).prop("tagName") == "ns2:LatestOdds" && $(this).attr('combStr') == "H"){
                                                condtion_val = $(this).attr('condition');
                                                $(this).children().each(function(){
                                                    if($(this).prop("tagName") == 'ns5:Odds'){
                                                        odds_h[condtion_val] = $(this).text();
                                                    }
                                                });
                                            }else if($(this).prop("tagName") == "ns2:LatestOdds" && $(this).attr('combStr') == "L"){
                                                condtion_val = $(this).attr('condition');
                                                $(this).children().each(function(){
                                                    if($(this).prop("tagName") == 'ns5:Odds'){
                                                        odds_l[condtion_val] = $(this).text();
                                                    }
                                                });
                                            }
                                        }else if(c_betType == "HDC"){
                                            if($(this).prop("tagName") == "ns2:LatestOdds" && $(this).attr('combStr') == "H"){
                                                condtion_val = $(this).attr('condition');
                                                $(this).children().each(function(){
                                                    if($(this).prop("tagName") == 'ns5:Odds'){
                                                        odds_h1[condtion_val] = $(this).text();
                                                    }
                                                });
                                            }else if($(this).prop("tagName") == "ns2:LatestOdds" && $(this).attr('combStr') == "A"){
                                                condtion_val = $(this).attr('condition');
                                                $(this).children().each(function(){
                                                    if($(this).prop("tagName") == 'ns5:Odds'){
                                                        odds_a1[condtion_val] = $(this).text();
                                                    }
                                                });
                                            }
                                        }

                                    });
                                    
                                    $.each(odds_h,function(i,j){
                                        odds_hl[i] = {
                                            'h': j,
                                            'l': odds_l[i],
                                        };
                                        if(c_betType == "HIL"){
                                            odds_hl[i]['i'] = i;
                                        }else if(c_betType == "FHL"){
                                            odds_hl[i]['f'] = i;
                                        }else if(c_betType == "CHL"){
                                            odds_hl[i]['c'] = i;
                                        }
                                    });

                                    $.each(odds_h1, function(i, j){
                                        odds_cha1[i] = {
                                            'h': j,
                                            'a': odds_a1[i],
                                            'c': i,
                                        }
                                    })

                                    if(c_betType == 'HIL'){
                                        odds_hil = odds_hl;
                                    }else if(c_betType == "FHL"){
                                        odds_fhl = odds_hl;
                                    }else if(c_betType == "CHL"){
                                        odds_chl = odds_hl;
                                    }else if(c_betType == "HDC"){
                                        odds_hdc = odds_cha1;
                                    }
                                    
                                    $.each(odds_adhn, function(i,j){
                                        if(c_betType == "HAD"){
                                            odds_had[i] = j;
                                        }else if(c_betType == "HHA"){
                                            odds_hha[i] = j;
                                        }else if(c_betType == "FTS"){
                                            odds_fts[i] = j;
                                        }
                                    });
                                    if(typeof finalResult['odds'] == "undefined"){
                                        finalResult['odds'] = {};
                                    }
                                
                                    switch (c_betType){
                                        case 'HAD':
                                            finalResult['odds']['HAD'] = odds_had;
                                            break;
                                        case 'HHA':
                                            finalResult['odds']['HHA'] = odds_hha;
                                            break;
                                        case 'HIL':
                                            finalResult['odds']['HIL'] = odds_hil;
                                            break;
                                        case 'FHL': 
                                            finalResult['odds']['FHL'] = odds_fhl;
                                            break;
                                        case 'CHL':
                                            finalResult['odds']['CHL'] = odds_chl;
                                            break;
                                        case 'FTS':
                                            finalResult['odds']['FTS'] = odds_fts;
                                            break;
                                        case "HDC":
                                            finalResult['odds']['HDC'] = odds_hdc;
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });
    }
    let m_idTrack = new Array();
    function oddsExt(f_data, m_id, r_betType){
        let oeFlag = false;
        $(f_data).children().children().each(function(){
            if($(this).prop("tagName") == "ns2:GetConfOddsResponse"){
                $(this).children().each(function(){
                    if($(this).prop("tagName") == "ns2:FixedOddsPools"){
                        $(this).children().each(function(){
                            if($(this).prop("tagName") == "ns2:Pool"){
                                let p_id = $(this).attr('poolID');

                                $(this).children().each(function(){
                                    if($(this).prop("tagName") == "ns3:Base"){
                                        $(this).children().each(function(){
                                            if($(this).prop("tagName") == "ns3:BetType"){
                                                if($(this).text() == r_betType){
                                                    betType = $(this).text();
                                                    oeFlag = true;
                                                }
                                                //finalResult['betType'] = $(this).text();
                                            }else if($(this).prop("tagName") == "ns3:UnitBet"){
                                                //finalResult['unitBet'] = $(this).text();
                                            }
                                        });
                                    }else if($(this).prop("tagName") == "ns3:Match" && oeFlag){
                                        oeFlag = false;
                                        let o_mID = $(this).attr('matchID');
                                        if(o_mID == m_id && typeof betType != "undefined" && typeof p_id != "undefined"){
                                            finalResult['pool_id'] = p_id;
                                            finalResult['betType'] = betType;
                                            poolDetails(f_data,p_id,r_betType);
                                        }
                                    }
                                });
                            }
                        });
                    }
                })
            }
        });
    }
    function matchext(matches, LaT,f_data){
        $(matches).each(function(){
            finalResult['matchNo'] = $(this).attr('matchNo');
            finalResult['matchId'] = $(this).attr('matchID');
            $(this).children().each(function (){
                if($(this).prop("tagName") == "ns2:MatchTime"){
                    matchData['matchTime'] = $(this).text();
                }

                if($(this).prop("tagName") == "ns2:Status"){
                    matchData['matchStatus'] = $(this).text();
                }
    
                if($(this).prop("tagName") == "ns2:LeagueID"){
                    matchData['matchLeagueId'] = $(this).text();
                }

                if($(this).prop("tagName") == "ns2:AwayTeamID"){
                    matchData['awayTeamId'] = $(this).text();
                }

                if($(this).prop("tagName") == "ns2:HomeTeamID"){
                    matchData['homeTeamId'] = $(this).text();
                }

                if(matchData['matchTime'] && matchData['matchStatus'] && matchData['matchLeagueId']){
                    finalResult['matchTime'] = matchData['matchTime'];
                    finalResult['matchStatus'] = matchData['matchStatus'];
                    $(betTypeList).each(function(i, j){
                        oddsExt(f_data,finalResult['matchId'],j);
                    });
                    leagueExt(matchData, LaT);
                    matchData = {};
                }
            });
        });
    }

    function xmlmapping(data,f_data,callback){
        let matches = null;
        let league_and_tournament = null;
        $(data).children().children().each(function(){
            if($(this).prop("tagName") == "ns2:GetActiveMatchesResponse"){
                $(this).children().each(function(){
                    if($(this).prop("tagName") == "ns2:FootballEvent"){
                        matches = $(this).children();
                    }else if($(this).prop("tagName") == "ns2:FootballProfile"){
                        league_and_tournament = $(this).children();
                    }

                    if(matches && league_and_tournament){
                        matchext(matches, league_and_tournament, f_data);
                        matches = null;
                        league_and_tournament = null;
                    }
                });
            }
        });
        if(callback){
            callback(data);
        }
    }

    $("#file_upload").on('change', function(data){
        fileUploadDetails = {};
        if(data.target.value.length > 0){
            fileUploadDetails['fileName'] = data.target.files[0].name;
            fileUploadDetails['fileType'] = fileUploadDetails['fileName'].replace(/^.*\./, '');
            $("#filenamelabel").html(`<b>File Name:&nbsp;</b>${fileUploadDetails['fileName']}`);
            flag = true;
        }else{
            $("#filenamelabel").html(`<b>File Name:&nbsp;</b>No File Selected..`);
        }
        //fileUploadDetails['uploadFile'] = data.target.files;
    });
    $('#uploadForm').on('submit',function(e){
        if(typeof fileUploadDetails['fileName'] != 'undefined'){
            if(typeof fileUploadDetails['fileType'] && fileUploadDetails['fileType'] == 'xml'){
                $.ajax({
                    url:window.location.origin+"/peter/exe/fileupload.php",
                    type:"POST",
                    data: new FormData(this),
                    datatype:'JSON',
                    contentType: false,
                    cache: false,
                    processData:false,
                    beforeSend : function(){},
                    success: function(data){
                        data = JSON.parse(data);
                        if(typeof data['error'] != "null"){
                            if(typeof data['formErr'] != "null"){
                                if(typeof data['success'] != "null"){
                                    console.log(data['success']);
                                    console.log(data['fileID'])
                                    fileUploadDetails['fileID'] = data['fileID'];
                                    $.ajax({
                                        url:window.location.origin+"/peter/uploaded_files/"+data['filename'],
                                        type:'GET',
                                        datatype: 'xml',
                                        success: function(xmlData){
                                            console.log(xmlData);
                                            xmlmapping(xmlData,xmlData,function(){});
                                        },
                                        error: function(xmlError){
                                            console.log(JSON.stringify(xmlError));
                                        }
                                    });
                                }
                            }else{
                                console.log(data['formErr']);
                            }
                        }else{
                            console.log(data['error']);
                        }
                    },
                    error:function(error){
                        console.log(JSON.stringify(error));
                    },
                });
            }else{
                console.log("Please select XML file only");
            }
        }else{
            console.log("Please select one file");
        }
        e.preventDefault();
    });
});
