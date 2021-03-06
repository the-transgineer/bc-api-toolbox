const request = require('request');

class Toolbox{
    constructor(key,id,hash){
        this.hash = hash;
        this.requests = 0;
        this.options = {
            url: `https://api.bigcommerce.com/stores/${hash}/v3/`,
            headers: {
                'X-Auth-Client': id,
                'X-Auth-Token': key,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }
    }

    getTotalNumber(callback){
        this.checkRequests(() => {
            this.options.url = `https://api.bigcommerce.com/stores/${this.hash}/v3/catalog/products`;
            request.get(this.options, (err,res,body) => {
                if(res.statusCode === 429){
                    setTimeout(() => {
                        this.getTotalNumber(backup => {
                            callback(backup);
                        })

                    }, Number(res.headers['x-rate-limit-time-reset-ms']))
                }
                const data = body;
                callback(JSON.parse(data).meta.pagination.total);
            })
        })
    };

    getProductIds(callback){
        this.checkRequests(() => {
            this.getTotalNumber(number => {
                let ids = [];
                for(let x=0;x<=number/50;x++){
                    this.options.url = `https://api.bigcommerce.com/stores/${this.hash}/v3/catalog/products?page=${x+1}&limit=50`;
                    request.get(this.options, (err,res,body) => {
                        if(res.statusCode === 429){
                            setTimeout(() => {
                                this.getProductIds(backup => {
                                    callback(backup);
                                })

                            }, Number(res.headers['x-rate-limit-time-reset-ms']))
                        }
                        const data = JSON.parse(body).data;
                        data.forEach(item  => {
                            ids.push(item.id);
                        });
                        if(ids.length === number){
                            callback(ids);
                        }
                    })
                }
            })
        })
    }

    getAllProducts(callback){
        this.checkRequests(() => {
            this.getTotalNumber(number => {
                let products = [];
                for(let x=0;x<=number/50;x++){
                    this.options.url = `https://api.bigcommerce.com/stores/${this.hash}/v3/catalog/products?page=${x+1}&limit=50`;
                    request.get(this.options, (err,res,body) => {
                        if(res.statusCode === 429){
                            setTimeout(() => {
                                this.getAllProducts(backup => {
                                    callback(backup);
                                })

                            }, Number(res.headers['x-rate-limit-time-reset-ms']))}
                        const data = JSON.parse(body).data;
                        data.forEach(item  => {
                            products.push(item);
                        });
                        if(products.length === number){
                            callback(products);
                        }
                    })
                }
            })
        })
    }

    getTotalOrders(callback){
        this.checkRequests(() => {
            this.options.url = `https://api.bigcommerce.com/stores/${this.hash}/v2/orders`;
            request.get(this.options, (err,res,body) => {
                if(res.statusCode === 429){
                    setTimeout(() => {
                        this.getTotalOrders(backup => {
                            callback(backup);
                        })

                    }, Number(res.headers['x-rate-limit-time-reset-ms']))
                }
                const data = body;
                callback(JSON.parse(data).length);
            })
        })
    }

    getAllOrders(callback){
        this.checkRequests(() =>{
            this.options.url = `https://api.bigcommerce.com/stores/${this.hash}/v2/orders`;
            request.get(this.options, (err,res,body) => {
                if(res.statusCode === 429){
                    setTimeout(() => {
                        this.getAllOrders(backup => {
                            callback(backup);
                        })

                    }, Number(res.headers['x-rate-limit-time-reset-ms']))
                }
                const data = body;
                callback(JSON.parse(data));
            })
        })
    }

    getTotalCustomers(callback){
        this.checkRequests(() =>{
            this.options.url = `https://api.bigcommerce.com/stores/${this.hash}/v2/customers`;
            request.get(this.options, (err,res,body) => {
                if(res.statusCode === 429) {
                    setTimeout(() => {
                        this.getTotalCustomers(backup => {
                            callback(backup);
                        })

                    }, Number(res.headers['x-rate-limit-time-reset-ms']))
                }
                const data = body;
                callback(JSON.parse(data).length);
            })
        })
    }

    getAllCustomers(callback){
        this.checkRequests(() =>{
            this.options.url = `https://api.bigcommerce.com/stores/${this.hash}/v2/customers`;
            request.get(this.options, (err,res,body) => {
                if(res.statusCode === 429){
                    setTimeout(() => {
                        this.getAllCustomers(backup => {
                            callback(backup);
                        })

                    }, Number(res.headers['x-rate-limit-time-reset-ms']))
                }
                const data = body;
                callback(JSON.parse(data));
            })
        })
    }

    getProductImageUrls(id, callback){
        this.checkRequests(() => {
            this.options.url = `https://api.bigcommerce.com/stores/${this.hash}/v3/catalog/products/${id}/images`;
            let urlArr = [];
            request.get(this.options, (err,res,body) => {
                this.requests = this.requests + 1;
                if(res.statusCode === 429){
                    setTimeout(() => {
                        this.getProductImageUrls(id, backup => {
                            callback(backup);
                        })

                    }, Number(res.headers['x-rate-limit-time-reset-ms']))
                }
                else {
                    const data = JSON.parse(body).data;
                    const total = JSON.parse(body).meta.pagination.total;
                    if (total > 0) {
                        data.forEach((image, index) => {
                            urlArr.push(image.url_zoom);
                            if (index === total - 1) {
                                callback(urlArr);
                            }
                        })
                    }
                    else {
                        callback(urlArr);
                    }
                }
            })
        })
    }


    getAdminEmail(callback){
        this.checkRequests(() => {
            this.options.url = `https://api.bigcommerce.com/stores/${this.hash}/v2/store`;
            request.get(this.options, (err,res,body) => {
                const data = JSON.parse(body);
                callback(data.admin_email);
            })
        })
    }

    checkRequests(callback){
        if(this.requests % 5 === 0){
            setTimeout(()=>{
                callback();
            }, 250)
        }
    }

    getCategories(callback){
        this.checkRequests(() => {
            this.options.url = `https://api.bigcommerce.com/stores/${this.hash}/v3/catalog/categories`
            request.get(this.options, (err,res, body)=> {
                const data = JSON.parse((body));
                callback(data);
            })
        })
    }

}



module.exports = Toolbox;

