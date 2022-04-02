var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

// title, list, body, control 을 입력받아 HTML string literal 을 반환하는 함수
function templateHTML(title, list, body, control) {
    return `
    <!doctype HTML>
    <html>
    <head>
        <title>Node.js_WEB - ${title}</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${control}
        ${body}
    </body>
    </html>
    `;
}

function templateList(filelist) {
    var list = '<ul>';
    var i = 0;
    while (i < filelist.length) {
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i++;
    }
    list = list + '</ul>';

    return list;
}

var app = http.createServer(function(request, response){
    var _url = request.url;
    var pathname = url.parse(_url, true).pathname;
    var queryData = url.parse(_url, true).query;

    console.log(_url);
    console.log(pathname);
    console.log(queryData);

    // 기본 페이지 출력에 대한 작업을 처리하는 부분
    if (pathname === '/') {
        // 글 목록을 불러온다.
        fs.readdir('./data', (err, filelist) => {
            var list = templateList(filelist);

            // main 화면(id 가 undefined 인 경우)에 대한 요청 처리
            if (queryData.id === undefined) {
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var body = `<h2>${title}</h2><p>${description}</p>`;
                var control = `<a href="/create">create</a>`;
                var template = templateHTML(title, list, body, control);

                response.writeHead(200);
                response.end(template);
            }
            // 요청된 id 가 있는 경우
            else {
                fs.readFile(`data/${queryData.id}`, 'utf8', (err, description) => {
                    var title = queryData.id;
                    var body = `<h2>${title}</h2><p>${description}</p>`;
                    var control = `<a href="/create">create</a>
                    <a href="/update?id=${title}">update</a>
                    <form action="delete_process" method="POST">
                        <input type="hidden" name="id" value="${title}">
                        <input type="submit" value="delete">
                    </form>
                    `;

                    var template = templateHTML(title, list, body, control);

                    response.writeHead(200);
                    response.end(template);
                });
            }
        });
    }
    // 글 작성 요청에 대한 작업을 처리하는 부분
    else if (pathname === '/create') {
        fs.readdir('./data', (err, filelist) => {
            var title = 'Create';
            var list = templateList(filelist);
            var body = `
            <form action="/create_process" method="POST">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                    <textarea name="description" placeholder="description"></textarea>
                </p>
                <p><input type="submit"></p>
            </form>
            `;
            var control = '';
            var template = templateHTML(title, list, body, control);
            
            response.writeHead(200);
            response.end(template);
        });
    }
    // 작성된 글 게시 요청에 대한 작업을 처리하는 부분
    else if (pathname === '/create_process') {
        var body = '';

        // data 조각들을 모두 받는다.
        request.on('data', (chunk) => {
            body += chunk;
        });
        // data 가 모두 전송되었을 때의 작업을 처리하는 부분
        request.on('end', () => {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end();
            })
        });
    }
    // 작성된 글 삭제 요청에 대한 작업을 처리하는 부분
    else if (pathname === '/delete_process') {
        var body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });
        request.on('end', () => {
            var post = qs.parse(body);
            var fileName = post.id;
            fs.unlink(`data/${fileName}`, (err) => {
                response.writeHead(302, {Location: '/'});
                response.end();
            });
        });
    }
    // 글 수정 요청에 대한 작업을 처리하는 부분
    else if (pathname === '/update') {
        fs.readdir('./data', (err, filelist) => {
            var title = queryData.id;
            var list = templateList(filelist);
            fs.readFile(`data/${queryData.id}`, 'utf8', (err, description) => {
                var body = `
                <form action="/update_process" method="POST">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p><input type="submit"></p>
                </form>
                `;

                var control = `
                <a href="/create">create</a>
                <a href="/update?id=${title}">update</a>
                `;
                
                var template = templateHTML(title, list, body, control);
                response.writeHead(200);
                response.end(template);
            });
        });
    }
    else if (pathname === '/update_process') {
        var body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });
        request.on('end', () => {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, (err) => {
                fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                });
            });
        })
    }
    else {
        response.writeHead(404);
        response.end('404 - Not Found');
    }
});
app.listen(3000);