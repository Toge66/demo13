export function uploads(list = []) {
    let arr = []
    list.forEach((line) => {
        arr.push(new Promise((resolve) => {
            try {
                upload(line, resolve)
            } catch (e) {
                console.log(e)
            }
        }))
    })

    return fnResolvePromiseList(arr).then(data => {
        return data
    })
}

function upload(option, resolve) {
    const xhr = new XMLHttpRequest()

    const formData = new FormData()

    if (option.data) {
        Object.keys(option.data).map(key => {
            formData.append(key, option.data[key])
        })
    }

    formData.append(option.filename, option.file)

    xhr.onerror = function error(e) {
        option.onError(e)
    }

    xhr.onload = function onload() {
        if (xhr.status < 200 || xhr.status >= 300) {
            // return option.onError(getError(option, xhr))
        }
        resolve(option.data)

    }

    xhr.open('post', option.action, true)

    if (option.withCredentials && 'withCredentials' in xhr) {
        xhr.withCredentials = true
    }

    const headers = option.headers || {}

    if (headers['X-Requested-With'] !== null) {
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    }

    for (const h in headers) {
        if (headers.hasOwnProperty(h) && headers[h] !== null) {
            xhr.setRequestHeader(h, headers[h])
        }
    }

    xhr.send(formData)

    return {
        abort() {
            xhr.abort()
        }
    }
}

export function getToken(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.onload = function () {
            console.log(xhr.response.value)
            resolve(xhr.response.value)
        }
        xhr.responseType = 'json'
        xhr.open('get', url);
        xhr.send();
    })
}

export function getFiles(params, url) {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest()
        xhr.onload = function () {
            resolve(xhr.response.items)
        }
        xhr.responseType = 'json'
        const data = JSON.stringify({keys:params})
        xhr.open('post', url);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(data);
    })

}

function fnResolveCheck(fg = []) {
    let i = -1
    while (++i < fg.length) {
        if (!fg[i]) {
            return false
        }
    }
    return true
}

function fnWrapPromise(promise, resolve, i, data, fg) {
    let fn = (b, d) => {
        data[i] = { error: b, value: d }
        fg[i] = true
        if (fnResolveCheck(fg)) {
            resolve(data)
        }
    }
    promise
        .then(d => fn(false, d))
        .catch(e => fn(true, e))
}

function fnResolvePromiseList(array) {
    let data = new Array(array.length)
    let fg = new Array(array.length)

    return new Promise(resolve => {
        array.forEach((p, i) => {
            fnWrapPromise(p, resolve, i, data, fg)
        })
    })
}

export function generateFileName(OriginalName) {
    let random = Math.floor(Math.random() * 1000) + 1
    let now = Date.now()

    let filename = ''
    let arr = OriginalName && OriginalName.split('.')
    if (arr.length > 1) {
        filename = `.${arr[arr.length - 1]}`
    }

    return `${now}-${random}-${filename}`
}

export function buildData(file, tokenData) {
    let { name } = file
    const fileName = generateFileName(name)
    let params = { key: fileName, 'x:originalname': name, name: fileName }
    const { ossaccessKeyId, policy, signature } = tokenData
    params.OSSAccessKeyId = ossaccessKeyId
    params.policy = policy
    params.signature = signature
    return params
}