const inquirer = require("inquirer");
const fs = require("fs");
const conversion = require("phantom-html-to-pdf")();
const axios = require("axios");
const pdf = require('html-pdf');
const util = require("util");

function promptUser() {
  return inquirer.prompt([{
    type: "input",
    message: "Enter your GitHub username:",
    name: "username"
  }, {
    type: "list",
    message: "What's your favorite color?",
    name: "faveColor",
    choices: ['red', 'pink', 'green', 'blue']
  }]);
}

let readyToConvert = false;
promptUser()
  .then(function ({ username, faveColor }) {

    const queryUrl = `https://api.github.com/users/${username}`;
    axios
      .get(queryUrl).then(function (res) {
        console.log(res);
        info = {
          color: faveColor,
          profilePic: res.data.avatar_url,
          name: res.data.login,
          location: res.data.location,
          profileUrl: res.data.html_url,
          blog: res.data.blog,
          bio: res.data.bio,
          company: res.data.company,
          repos: res.data.public_repos,
          followers: res.data.followers,
          following: res.data.following,
        }
        console.log(info);

        const newQueryUrl = `https://api.github.com/users/${username}/repos`;
        console.log(newQueryUrl);

        axios.get(newQueryUrl).then(function (res) {
          let starCount = 0;
          for (let index = 0; index < res.data.length; index++) {
            let count = res.data[index].stargazers_count;
            starCount = starCount + count;

          }
          console.log("Final star count for all repositories: " + starCount)
          info.starCount = starCount;
          const html = generateHTML(info);

          console.log(`${username}.html is ready to convert to PDF`);
          readyToConvert = true;

          // for testing the HTML file that gets written to disk
          fs.writeFileSync(`${username}.html`, html);

          // https://www.npmjs.com/package/html-pdf
          var options = { format: 'landscape' };
          pdf.create(html, options).toFile(`${username}.pdf`, function (err, res) {
            if (err) return console.log(err);
            console.log(res);
          });

        });
      });
    // })
    //.then(function () {




    // })

    //.then(function () {
  })
  .catch(function (err) {
    console.log(err);

  });


function generatePdf(html) {
  let conversion = convertFactory({

    converterPath: convertFactory.converters.PDF

  });

  conversion({
    html: html,
    waitForJs: true,
    waitForJsVarName: readyToConvert,
  },
    function (err, result) {
      if (err) {
        return console.log(err);
      }

      result.stream.pipe(fs.createWriteStream(`${username}.pdf`));

      conversion.kill();

      console.log(`${username}.pdf is now available in your current directory`);
    });
}
const colors = {
  green: {
    wrapperBackground: "green",
    headerBackground: "#C1C72C",
    headerColor: "black",
    photoBorderColor: "#black"
  },
  blue: {
    wrapperBackground: "blue",
    headerBackground: "#26175A",
    headerColor: "white",
    photoBorderColor: "#73448C"
  },
  pink: {
    wrapperBackground: "pink",
    headerBackground: "#FF8374",
    headerColor: "white",
    photoBorderColor: "#FEE24C"
  },
  red: {
    wrapperBackground: "red",
    headerBackground: "#870603",
    headerColor: "white",
    photoBorderColor: "white"
  }
};
function generateHTML(info) {
  return `<!DOCTYPE html>
  <html lang="en">
     <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css"/>
        <link href="https://fonts.googleapis.com/css?family=BioRhyme|Cabin&display=swap" rel="stylesheet">
        <title>HTML for the PDF</title>
        <style>
            @page {
              margin: 0;
            }
           *,
           *::after,
           *::before {
           box-sizing: border-box;
           }
           html, body {
           padding: 0;
           margin: 0;
           }
           html, body, .wrapper {
           height: 100%;
           }
           .wrapper {
           background-color: white;
           padding-top: 100px;
           }
           body {
           background-color: ${colors[info.color].wrapperBackground};
           -webkit-print-color-adjust: exact !important;
           font-family: 'Cabin', sans-serif;
           }
           main {
           background-color: #E9EDEE;
           height: auto;
           padding-top: 30px;
           }
           h1, h2, h3, h4, h5, h6 {
           font-family: 'BioRhyme', serif;
           margin: 0;
           }
           h1 {
           font-size: 3em;
           }
           h2 {
           font-size: 2.5em;
           }
           h3 {
           font-size: 2em;
           }
           h4 {
           font-size: 1.5em;
           }
           h5 {
           font-size: 1.3em;
           }
           h6 {
           font-size: 1.2em;
           }
           .photo-header {
           position: relative;
           margin: 0 auto;
           margin-bottom: -50px;
           display: flex;
           justify-content: center;
           flex-wrap: wrap;
           background-color: ${colors[info.color].headerBackground};
           color: ${colors[info.color].headerColor};
           padding: 10px;
           width: 95%;
           border-radius: 6px;
           }
           .photo-header img {
           width: 250px;
           height: 250px;
           border-radius: 50%;
           object-fit: cover;
           margin-top: -75px;
           border: 6px solid ${colors[info.color].photoBorderColor};
           box-shadow: rgba(0, 0, 0, 0.3) 4px 1px 20px 4px;
           }
           .photo-header h1, .photo-header h2 {
           width: 100%;
           text-align: center;
           }
           .photo-header h1 {
           margin-top: 10px;
           }
           .links-nav {
           width: 100%;
           text-align: center;
           padding: 20px 0;
           font-size: 1.1em;
           }
           .nav-link {
           display: inline-block;
           margin: 5px 10px;
           }
           .workExp-date {
           font-style: italic;
           font-size: .7em;
           text-align: right;
           margin-top: 10px;
           }
           .container {
           padding: 50px;
           padding-left: 100px;
           padding-right: 100px;
           }
  
           .row {
             display: flex;
             flex-wrap: wrap;
             justify-content: space-between;
             margin-top: 20px;
             margin-bottom: 20px;
           }
  
           .card {
             padding: 20px;
             border-radius: 6px;
             background-color: ${colors[info.color].headerBackground};
             color: ${colors[info.color].headerColor};
             margin: 20px;
           }
           
           .col {
           flex: 1;
           text-align: center;
           }
  
           a, a:hover {
           text-decoration: none;
           color: inherit;
           font-weight: bold;
           }
  
           @media print { 
            body { 
              zoom: .75; 
            } 
           }
        </style>
     </head> 
     <body>
        <div class="wrapper">
           <div class="photo-header">
              <img src="${info.profilePic}" alt="Photo of ${info.name}" />
              <h1>Hello!</h1>
              <h2>
              My name is ${info.name}!</h1>
              <h5>${info.company ? `Currently @ ${info.company}` : ""}</h5>
              <nav class="links-nav">
                 ${
    info.location
      ? `<a class="nav-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/place/${
      info.location
      }"><i class="fas fa-location-arrow"></i> ${
      info.location
      }</a>`
      : ""
    }
                 <a class="nav-link" target="_blank" rel="noopener noreferrer" href="${
    info.profileUrl
    }"><i class="fab fa-github-alt"></i> GitHub</a>
                 ${
    info.blog
      ? `<a class="nav-link" target="_blank" rel="noopener noreferrer" href="${
      info.blog
      }"><i class="fas fa-rss"></i> Blog</a>`
      : ""
    }
              </nav>
           </div>
           <main>
              <div class="container">
              <div class="row">
                 <div class="col">
                    <h3>${info.bio ? `${info.bio}` : ""}</h3>
                 </div>
                 </div>
                 <div class="row">
                 <div class="col">
                    <div class="card">
                      <h3>Public Repositories</h3>
                      <h4>${info.repos}</h4>
                    </div>
                 </div>
                  <div class="col">
                  <div class="card">
                    <h3>Followers</h3>
                    <h4>${info.followers}</h4>
                  </div>
                 </div>
                 </div>
                 <div class="row">
                 <div class="col">
                 <div class="card">
                    <h3>GitHub Stars</h3>
                    <h4>${info.starCount}</h4>
                    </div>
                 </div>
                  <div class="col">
                  <div class="card">
                    <h3>Following</h3>
                    <h4>${info.following}</h4>
                    </div>
                 </div>
                 </div>
              </div>
           </main>
        </div>
     </body>
  </html>`;
}

  // module.exports = generateHTML;

//      <body>
//       <div class="jumbotron jumbotron-fluid">
//         <div class="container">
//           <h1 class="display-4">Hi! My name is ${info.name}</h1>
//           <h2>A Little About Me: <span class="badge badge-secondary">${info.bio}</span></h2>
//           <ul class="list-group">
//             <li class="list-group-item">Location: ${info.location}</li>
//             <li class="list-group-item">GitHub: ${info.profileUrl}</li>
//             <li class="list-group-item">Blog: <a href="${info.blog}">${info.blog}</a></li>
//           </ul>
//           <img src='${info.profilePic}' height='200px' width='200px'>
//         </div>
//       </div>
//      </body>    
//     </html lang="en">
//       `
// }
