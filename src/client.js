const arr = require("rhinojs/support/arr");
const axios = require('axios');
const Config = require('./config');
const Global = require('./global');

class Client {
    /**
     * Construtor.
     */
    constructor(opts = {}) {
        this.client = this; // Alias to this.

        this.version = '1.1.0';
        this.params = {};
        this.options = {
            env: Config.envProduction,
            global_token: true,
        };
        Object.assign(this.options, opts);

        // Verificar se deve heardar o token do contexto global
        var globalToken = this.option('global_token') ? Global.get('auth.accessToken') : null;

        // Verificar se token foi informado ou recuperado do contexto
        this.setAccessToken(this.option('access_token', globalToken));

        // Verificar se id foi informado ou recuperado do contexto
        this.setSessaoId(this.option('sessao_id', ''));

        // Copiar env informado no opts para os parametros
        this.setParam('env', this.options.env);
    }

    /**
     * Executar acao GET.
     * 
     * @param {String} part Part da url
     * @param {Object} params Parametros da requisicao
     * @param {Object} queryInPost Query quando POST ou PUT
     * @param {Object} headers Informacoes para o header
     * @returns {any}
     */
    async get(part, params = {}, queryInPost = {}, headers = {})
    {
        return await this.requestJson('get', part, params, headers, queryInPost);
    }

    /**
     * Executar acao POST.
     * 
     * @param {String} part Part da url
     * @param {Object} params Parametros da requisicao
     * @param {Object} queryInPost Query quando POST ou PUT
     * @param {Object} headers Informacoes para o header
     * @returns {any}
     */
    async post(part, params = {}, queryInPost = {}, headers = {})
    {
        return await this.requestJson('post', part, params, headers, queryInPost);
    }

    /**
     * Executar acao PUT.
     * 
     * @param {String} part Part da url
     * @param {Object} params Parametros da requisicao
     * @param {Object} queryInPost Query quando POST ou PUT
     * @param {Object} headers Informacoes para o header
     * @returns {any}
     */
    async put(part, params = {}, queryInPost = {}, headers = {})
    {
        return await this.requestJson('put', part, params, headers, queryInPost);
    }

    /**
     * Executar acao DELETE.
     * 
     * @param {String} part Part da url
     * @param {Object} params Parametros da requisicao
     * @param {Object} queryInPost Query quando POST ou PUT
     * @param {Object} headers Informacoes para o header
     * @returns {any}
     */
    async delete(part, params = {}, queryInPost = {}, headers = {})
    {
        return await this.requestJson('delete', part, params, headers, queryInPost);
    }    
    
    /**
     * Fazer requisição ajax.
     * 
     * @param {String} method Metodo da requisicao
     * @param {String} part Part da url
     * @param {Object} params Parametros da requisicao
     * @param {Object} headers Informacoes para o header
     * @param {Object} queryInPost Query quando POST ou PUT
     * @returns {any}
     */
    async request(method, part, params = {}, headers = {}, queryInPost = {})
    {
        method = method.toLowerCase();

        var hdrs = {
            'Accept'        : 'application/json',
            'Cache-Control' : 'no-cache'
        };
        Object.assign(hdrs, headers);

        var req = {
            method: method,
            url: this.getUrl(part),
            headers: hdrs
        };

        // Tratar accesstoken
        if (this.getAccessToken()) {
            req.headers['Authorization'] = this.getAccessToken();
        }

        // Tratar sessao_id
        if (this.getSessaoId()) {
            req.headers['sessao_id'] = this.getSessaoId();
        }

        if ((method == 'post') || (method == 'put')) {
            req.data = params;
            req.params = queryInPost;
        } else {
            req.params = params;
        }

        try {
            // Executar requisicao
            var res = await axios(req);

            // Tratar erro que veio da API com status 200
            if (res.data.error) {
                throw res.data.error.message;
            }

            return res.data;
        } catch (err) {
            if ((err.response) && (err.response.data) && (err.response.data.error)) {
                throw err.response.data.error;
            }

            throw err;
        }        
    }

    /**
     * Fazer requisição ajax passando JSON.
     * 
     * @param {String} method Metodo da requisicao
     * @param {String} part Part da url
     * @param {Object} params Parametros da requisicao
     * @param {Object} headers Informacoes para o header
     * @param {Object} queryInPost Query quando POST ou PUT
     * @returns {any}
     */
    async requestJson(method, part, params = {}, headers = {}, queryInPost = {})
    {
        headers = Object.assign(headers, {
            'Content-Type': 'application/json'
        });

        return await this.request(method, part, params, headers, queryInPost);
    }

    /**
     * Retorna um option.
     * 
     * @param {String} key Chave do parametro
     * @param {object} vDefault Valor padrao
     */
    option(key, vDefault = null) {
        return arr.get(this.options, key, vDefault);
    }

    /**
     * Retorna um parametro.
     * 
     * @param {String} key Chave do parametro
     * @param {object} vDefault Valor padrao
     */
    param(key, vDefault = null) {
        return arr.get(this.params, key, vDefault);
    }

    /**
     * Atribuir um parametro.
     * 
     * @param {String } key Chave do parametro
     * @param {object} value Valor do parametro
     * @returns {Client}
     */
    setParam(key, value) {
        this.params[key] = value;

        if (key == 'accessToken') {
            Global.set('auth.accessToken', value);
        }

        return this;
    }

    /**
     * Alias: para atribuir o access_token.
     * 
     * @param {string} token Token de acesso
     * @returns {Client}
     */
    setAccessToken(token) {
        return this.setParam('accessToken', token);
    }

    /**
     * Alias: para atribuir o sessao_id.
     * 
     * @param {string} id Sessao ID
     * @returns {Client}
     */
    setSessaoId(id) {
        return this.setParam('sessao_id', id);
    }

    /**
     * Retorna o access_token.
     * 
     * @returns {string}
     */
    getAccessToken() {
        return this.param('accessToken');
    }

    /**
     * Retorna o sessao_id.
     * 
     * @returns {string}
     */
    getSessaoId() {
        return this.param('sessao_id');
    }

    /**
     * Retorna a versão do SDK.
     * 
     * @returns {String}
     */
    getVersion() {
        return this.version;
    }

    /**
     * Retorna a URL para acao.
     * 
     * @param {String} part Parte da URL
     * @returns {String}
     */
    getUrl(part) {
        var env = this.param('env', Config.envProduction);
        if (typeof Config.endpoints[env] != 'string') {
            throw new Error("ENV [" + env + "] nao configurado");
        }

        var base = Config.endpoints[env];
        part = part.trim();

        return (part != '') ? base + '/' + part : base;
    }

    /**
     * Define o env como produção.
     * @returns {Client}
     */
    production() {
        this.setParam('env', Config.envProduction);

        return this;
    }

    /**
     * Define o env como sandbox.
     * @returns {Client}
     */
    sandbox() {
        this.setParam('env', Config.envSandbox);

        return this;
    }

    /**
     * Define o env como local.
     * @returns {Client}
     */
    local() {
        this.setParam('env', Config.envLocal);

        return this;
    }
}

module.exports = Client;