var Button = AMUIReact.Button;
var Input = AMUIReact.Input;
var Panel = AMUIReact.Panel;
var Grid = AMUIReact.Grid;
var AvgGrid = AMUIReact.AvgGrid;
var Col = AMUIReact.Col;
var Article = AMUIReact.Article;
var Alert = AMUIReact.Alert;
var Topbar = AMUIReact.Topbar;
var CollapsibleNav = AMUIReact.CollapsibleNav;
var Nav = AMUIReact.Nav;
var NavItem = AMUIReact.NavItem;
var Selected = AMUIReact.Selected;
var DateTimeInput = AMUIReact.DateTimeInput;
var Progress = AMUIReact.Progress;

function exceptionToString(e) {
    console.log(e);
    if (typeof (e) == 'string') {
        return e;
    }
    if (e instanceof Error) {
        return '程序异常：' + e;
    }
    return '未知错误：' + JSON.stringify(e);
}

class DataStore {
    static getValue(key) {
        var value = localStorage.getItem(key);
        if (typeof (value) != "string") {
            value = null;
        }
        return value;
    }

    static getAccessKey() {
        return this.getValue("btcpool.accesskey");
    }

    static setAccessKey(ak) {
        if (typeof (ak) != "string") {
            throw "币看监控密钥或观察者链接必须为字符串";
        }

        ak = ak.trim()

        if (ak.length == 0) {
            throw "币看监控密钥或观察者链接不能为空";
        }
        if (ak.length < 15) {
            throw "币看监控密钥或观察者链接过短，请确认您已输入完整";
        }

        var parts = ak.match(/https:\/\/(?:([a-zA-Z0-9_-]+)\.)?pool\.btc\.com\/.*\baccess_key=([a-zA-Z0-9_-]+)/);
        if (parts != null) {
            localStorage.setItem("btcpool.watch_only", "true");
            localStorage.setItem("btcpool.region", parts[1]);
            localStorage.setItem("btcpool.accesskey", parts[2]);
        } else {
            localStorage.setItem("btcpool.watch_only", ak.match(/^r_/) == null ? "false" : "true");
            localStorage.setItem("btcpool.region", "false");
            localStorage.setItem("btcpool.accesskey", ak);
        }
    }

    static hasAccessKey() {
        return this.getAccessKey() != null;
    }

    static isWatchOnly() {
        return this.getValue("btcpool.watch_only") == "true";
    }

    static getRegion() {
        return this.getValue("btcpool.region");
    }

    static getEndpoint() {
        if (this.getValue("btcpool.region") == 'pre' || this.getValue("btcpool.region") == 'beta') {
            return 'https://' + this.getValue("btcpool.region") + '.pool.btc.com' + PoolAPI.endpointSuffix;
        }
        return PoolAPI.defaultEndpoint;
    }

    static clearAccessKey() {
        try {
            localStorage.removeItem("btcpool.accesskey");
            localStorage.removeItem("btcpool.region");
            localStorage.removeItem("btcpool.watch_only");
        } catch (e) {
            // ignore exceptions
        }
    }
}

var HidableAlert = function (props) {
    return props.visible ? (
        <Alert amStyle={props.amStyle}>
            <p>{props.alertText}</p>
        </Alert>
    ) : null;
}

var HidableProgress = function (props) {
    return props.now > 0 || props.label != '' ? (
        <Panel header={props.label}>
            <Progress striped amStyle={props.amStyle} now={props.now} />
        </Panel>
    ) : null;
}

function MainNavBar(props) {
    var handleSelectSubAccount = function (props) {
        if (props.active == "SelectSubAccount") {
            return false;
        }
        MainWindow.init();
    }
    var handleSwitchUser = function (props) {
        if (props.active == "SwitchUser") {
            return false;
        }
        MainWindow.switchUser();
    }
    var handleExit = function (props) {
        if (props.active == "Exit") {
            return false;
        }
        MainWindow.exit();
    }

    return (
        <Topbar brand="BTCPool算力导出工具 v0.2.5" toggleNavKey="nav">
            <CollapsibleNav eventKey="nav">
                <Nav topbar>
                    <NavItem active={props.active == "SwitchUser"} onClick={(props) => handleSwitchUser(props)} href="#">切换用户</NavItem>
                    <NavItem active={props.active == "SelectSubAccount"} onClick={(props) => handleSelectSubAccount(props)} href="#">选择子账户</NavItem>
                    <NavItem active={props.active == "Exit"} onClick={(props) => handleExit(props)} href="#">退出</NavItem>
                </Nav>
            </CollapsibleNav>
        </Topbar>
    );
}

class InputAccessKey extends React.Component {
    state = {
        accessKey: '',
        hasAlert: false,
        alertText: '',
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    handleAccessKeyChange(e) {
        this.setState({ accessKey: e.target.value });
    }

    handleClickNextStep() {
        try {
            MainWindow.saveAccessKey(this.state.accessKey);
        } catch (e) {
            this.setState({
                hasAlert: true,
                alertText: exceptionToString(e)
            });
        }
    }

    render() {
        return (
            <div>
                <MainNavBar active="SwitchUser" />
                <Panel header="请输入您从BTCPool获取的币看监控密钥">
                    <HidableAlert amStyle="secondary" visible={this.state.hasAlert} alertText={this.state.alertText} />
                    <Grid>
                        <Col sm={12} md={8}><Input type="password" placeholder="币看监控密钥或观察者链接" onChange={this.handleAccessKeyChange} /></Col>
                        <Col sm={12} md={4}><Button onClick={this.handleClickNextStep}>下一步</Button></Col>
                    </Grid>
                    <p>导出工具需要获得您的授权才能导出您在BTCPool的算力数据，而给予授权最简单的方式就是提供“币看监控密钥”或“观察者链接”。</p>
                    <p>您可以<a href="https://pool.btc.com/dashboard">登录BTCPool</a>，点击右上角的“设置”按钮，然后选择“共享数据”，再点击“获取币看监控密钥”，最后，将其中的“AccessKey”粘贴到上方的输入框即可。您也可以点击“观察者”，新建一个观察者链接并将链接完整的粘贴到此处。</p>
                    <p>注意，请<b>妥善保管</b>您的“币看监控密钥”，<b>不要将其提供给任何不信任的人或网站</b>。获得您的“币看监控密钥”相当于获得了您在矿池的登录状态，可以代替您在矿池进行一系列操作，包括但不限于创建子账户、切换币种等。观察者链接没有这样的风险，不过一次只能导出一个子账户的信息。</p>
                </Panel>
            </div>
        );
    }
}

class SelectSubAccount extends React.Component {
    // 根据币种分类的子账户数据
    subAccountData = [];
    // 用于根据puid找到subAccount的索引
    currentSubAccountIndex = {};

    state = {
        coinList: [
            { value: '', label: '加载中...' }
        ],
        subAccountList: [
            { value: '', label: '请先选择币种' }
        ],
        // 选中的币种
        selectedCoinType: '',
        // 选中的子账户（从currentSubAccountIndex中查找）
        selectedSubAccounts: [],
        //开始时间
        beginDate: moment.utc().subtract(7, 'days').format('YYYY-MM-DD'),
        //结束时间
        endDate: moment.utc().format('YYYY-MM-DD'),
        // 警告框数据
        hasAlert: false,
        alertText: '',
        // 进度条数据
        progress: 0,
        progressText: '',
        // 导出为单个表格
        singleTable: true,
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    async componentDidMount() {
        try {
            this.subAccountData = await PoolAPI.getSubAccounts();
            this.updateCoinList();

        } catch (e) {
            this.setState({
                hasAlert: true,
                alertText: exceptionToString(e)
            });
        }
    }

    updateCoinList() {
        try {
            var newCoinList = [];
            for (var coinType in this.subAccountData) {
                newCoinList.push({ value: coinType, label: coinType });
            }
            this.setState({
                coinList: newCoinList
            });

        } catch (e) {
            this.setState({
                hasAlert: true,
                alertText: exceptionToString(e)
            });
        }
    }

    coinTypeChanged(coinType) {
        try {
            this.currentSubAccountIndex = {}
            var newSubAccountList = [
                { value: 'all', label: '全部', sortby: '0' }
            ];

            for (var i in this.subAccountData[coinType]) {
                var account = this.subAccountData[coinType][i];
                this.currentSubAccountIndex[account.puid.toString()] = account;
                let label = account.name + ' (' + account.region_name + ')';
                newSubAccountList.push({
                    value: account.puid.toString(),
                    label: label,
                    sortby: label,
                });
            }

            newSubAccountList.sort(function (a, b) {
                return a.sortby.localeCompare(b.sortby);
            });

            this.setState({
                selectedCoinType: coinType,
                subAccountList: newSubAccountList
            });

        } catch (e) {
            this.setState({
                hasAlert: true,
                alertText: exceptionToString(e)
            });
        }
    }

    subAccountChanged(selected) {
        try {
            var selectedList = selected.split(',');
            var subAccounts = []

            for (var i in selectedList) {
                var key = selectedList[i]

                if (key == "all") {
                    subAccounts = this.currentSubAccountIndex;
                    break;
                }

                if (this.currentSubAccountIndex[key] != undefined) {
                    subAccounts.push(this.currentSubAccountIndex[key]);
                }
            }

            this.setState({
                selectedSubAccounts: subAccounts
            });

        } catch (e) {
            this.setState({
                hasAlert: true,
                alertText: exceptionToString(e)
            });
        }
    }

    beginTimeChanged(selected) {
        this.setState({
            beginDate: selected
        });
    }

    endTimeChanged(selected) {
        this.setState({
            endDate: selected
        });
    }

    singleTableChanged() {
        this.setState({
            singleTable: !this.state.singleTable
        });
    }

    updateProgress(percent, text) {
        let newState = {
            progress: percent,
            progressText: '(' + parseInt(percent) + '%) ' + text,
        };
        console.log(newState);
        this.setState(newState);
    }

    async handleClickExport(exportWorkers) {
        try {
            this.setState({
                hasAlert: false,
                alertText: ''
            });

            var coinType = this.state.selectedCoinType;
            var beginDate = this.state.beginDate;
            var endDate = this.state.endDate;
            var accounts = Object.values(this.state.selectedSubAccounts);
            var accountsNum = accounts.length;
            var singleTable = this.state.singleTable;
            var onlyOneTable = accountsNum == 1;
            var percent = 0;

            accounts.sort(function (a, b) {
                return (a.region_name + '.' + a.name).localeCompare(b.region_name + '.' + b.name);
            });

            if (accountsNum < 1) {
                throw "请选择一个要导出的子账户";
            }

            let fileAccountName = onlyOneTable ? (accounts[0].name) : (accountsNum.toString() + '_users');
            if (singleTable) {
                var singleTableContent = ""
                var csvName = coinType + '-' + fileAccountName + '-(' + beginDate + ',' + endDate + ')' + '.csv';
            }
            else {
                var zipName = coinType + '-' + fileAccountName + '-(' + beginDate + ',' + endDate + ')' + '.zip';
                var zip = new JSZip();
            }

            for (let i in accounts) {
                let account = accounts[i];
                let fileName = coinType + '-' + account.name + '-(' + beginDate + ',' + endDate + ')' + '.csv';
                let partPercent = percent;

                this.updateProgress(percent, '正在导出子账户 ' + account.name + ' (' + account.region_name + ')');

                let skipHeader = singleTable && i != 0
                let exportFunction = exportWorkers ? PoolAPI.makeWorkerHashrateCSV : PoolAPI.makeHashrateEarnCSV;
                let content = await exportFunction(account, beginDate, endDate, skipHeader, singleTable, (newPercent, text) => {
                    // 更新进度，其中 newPercent 是单个子账户的完成进度
                    // 缩放为所有子账户的完成进度
                    partPercent += newPercent / accountsNum;
                    text += ' ' + account.name + ' (' + account.region_name + ')';
                    this.updateProgress(partPercent, text);
                });

                if (singleTable) {
                    // 合并到单个文件
                    singleTableContent += content
                }
                else {
                    // 多个文件，加入压缩包
                    let blob = new Blob([content], { type: "text/comma-separated-values;charset=utf-8" });
                    zip.file(fileName, blob);
                }

                percent += 100 / accountsNum;
            }

            percent = 100;

            if (singleTable) {
                let blob = new Blob([singleTableContent], { type: "text/comma-separated-values;charset=utf-8" });
                saveAs(blob, csvName);
            }
            else {
                this.updateProgress(percent, '生成压缩包');

                let content = await zip.generateAsync({ type: "blob" });
                saveAs(content, zipName);
            }

            this.updateProgress(percent, '导出完成');

        } catch (e) {
            this.setState({
                hasAlert: true,
                alertText: exceptionToString(e)
            });
        }
    }

    render() {
        var dateProps = {
            showTimePicker: false,
            format: 'YYYY-MM-DD',
        };

        var style = {
            display: 'inline-block',
            maxWidth: '200px',
            margin: '10px',
        };

        return (
            <div>
                <MainNavBar active="SelectSubAccount" />
                <Panel header="请选择您要导出的币种、子账户及导出的时间段">
                    <HidableAlert amStyle="secondary" visible={this.state.hasAlert} alertText={this.state.alertText} />
                    <div>
                        <div style={style}><Selected data={this.state.coinList} placeholder="选择币种" onChange={this.coinTypeChanged} /></div>
                        <div style={style}><Selected data={this.state.subAccountList} placeholder="选择子账户" onChange={this.subAccountChanged} multiple={true} /></div>
                        <div style={style}><DateTimeInput onSelect={this.beginTimeChanged} dateTime={this.state.beginDate} {...dateProps} /></div>
                        <div style={style}><DateTimeInput onSelect={this.endTimeChanged} dateTime={this.state.endDate} {...dateProps} /></div>
                        <div style={style}><Input type="checkbox" label="导出为单个表格" checked={this.state.singleTable} onChange={this.singleTableChanged} inline /></div>
                        <div style={style}><Button onClick={() => this.handleClickExport(false)}>导出子账户日算力/收益</Button></div>
                        <div style={style}><Button onClick={() => this.handleClickExport(true)}>导出矿机日算力</Button></div>
                    </div>
                    <p>
                        请注意，导出结果中的日期采用UTC时区，相当于北京时间8点到次日8点。
                        若您的时区与UTC时区不同，则您在特定时段（比如北京时间0点到8点）访问矿池网页时，看到的日期可能会与导出结果相差一天。
                        这是矿池页面的显示缺陷所致，原因是矿池页面使用本地时区进行日期格式化，并且您的时区已经进入第二天，但UTC时区尚未进入第二天。
                </p>
                    <HidableProgress now={this.state.progress} label={this.state.progressText} amStyle="success" />
                </Panel>
            </div>
        );
    }
}

class ExitPage extends React.Component {
    render() {
        return (
            <div>
                <MainNavBar active="Exit" />
                <Panel header="退出成功">
                    <p>您已退出，您的“币看监控密钥”已从浏览器移除。</p>
                    <p>若想再次使用本工具，请点击导航栏上的“切换用户”按钮。</p>
                </Panel>
            </div>
        );
    }
}

class PoolAPI {
    static defaultEndpoint = 'https://b2api.hu60.cn/v1.php';
    static endpointSuffix = '/v1';

    static ak() {
        var ak = DataStore.getAccessKey();
        if (ak == null) {
            throw "币看监控密钥或观察者链接为空";
        }
        return ak;
    }

    static get(endpoint, api, params) {
        if (typeof (params) != 'object') {
            params = {};
        }
        params.access_key = PoolAPI.ak();
        return $.get(endpoint + '/' + api, params);
    }

    static async getSubAccounts() {
        var endpoint = DataStore.getEndpoint();
        var result = await PoolAPI.get(endpoint, 'account/sub-account/list');
        if (typeof (result) != 'object') {
            throw "获取子账户列表失败，结果不是对象：" + JSON.stringify(result);
        }
        if (result.err_no != 0) {
            throw "获取子账户列表失败：" + JSON.stringify(result.err_msg);
        }

        var list = {/*
            "BTC": [
                {"puid":1, "name":"aaa", "endpoint":"cn-pool.api.btc.com", "region_name":"cn"},
                {"puid":2, "name":"xxx", "endpoint":"sz-pool.api.btc.com", "region_name":"sz"},
                ...
            ],
            "BCH": [
                {"puid":6, "name":"fff", "endpoint":"us-bccpool.api.btc.com", "region_name":"us"},
                {"puid":9, "name":"xxx_bcc", "endpoint":"sz-bccpool.api.btc.com", "region_name":"sz"},
                ...
            ],
            ...
        */};

        for (var i in result.data) {
            var accountData = result.data[i];
            var account = {
                puid: accountData.puid,
                name: accountData.name,
                endpoint: endpoint,
                region_name: accountData.region_name,
            };

            if (list[accountData.coin_type] == undefined) {
                list[accountData.coin_type] = [];
            }
            list[accountData.coin_type].push(account);
        }

        return list;
    }

    static async _getEarnList(account, page) {
        var params = {
            puid: account.puid,
            page: page,
            reason: 1,
            page_size: 50,
            is_decimal: 0,
        };

        var result = await PoolAPI.get(account.endpoint, 'account/earn-history/multi-addr', params);

        if (typeof (result) != 'object') {
            throw "获取收益列表失败，结果不是对象：" + JSON.stringify(result);
        }
        if (result.err_no != 0) {
            throw "获取收益列表失败：" + JSON.stringify(result.err_msg);
        }

        return result.data.list;
    }

    static async getHashRateAndEarnList(account, beginDate, endDate, addPartPercent) {
        var beginTimeStamp = moment.utc(beginDate).valueOf();
        var endTimeStamp = moment.utc(endDate).valueOf();

        if (endTimeStamp < beginTimeStamp) {
            var t = endTimeStamp;
            endTimeStamp = beginTimeStamp;
            beginTimeStamp = t;
        }

        var fullList = [/*
            { date: '2018-01-01', hashrate: '1.25P', reject_rate: '0.5%', earn: 38000, paid_amount: 38000, payment_tx: '', address: '', unpaid_reason: 'xxxxx' },
            { date: '2018-01-02', hashrate: '2P', reject_rate: '0.3%', earn: 66666666, paid_amount: 66666666, payment_tx: 'xxxxx', address: 'xxxxx', unpaid_reason: '' },
            ...
        */];

        var days = (moment.utc().valueOf() - beginTimeStamp) / 1000 / 3600 / 24;
        var pages = Math.ceil(days / 50);
        addPartPercent(0, '获取收益列表...');

        var addedDates = {};
        var minTime = endTimeStamp;
        for (var p = 1; minTime >= beginTimeStamp; p++) {

            // 整个partList是按照从最新到最老（时间逆序）排列的
            var partList = await PoolAPI._getEarnList(account, p);

            if (typeof (partList) != 'object' || partList.length == undefined || partList.length < 1) {
                addPartPercent(100 * (pages - p + 1) / pages, '获取收益列表 (' + pages + '/' + pages + ')');
                break;
            }
            addPartPercent(100 / pages, '获取收益列表 (' + p + '/' + pages + ')');

            for (var i in partList) {
                var record = partList[i];
                var time = moment.utc(record.date, 'YYYYMMDD').valueOf();

                // 新于结束时间
                if (time > endTimeStamp) {
                    continue;
                }

                if (time < minTime) {
                    minTime = time;
                }

                // 老于开始时间
                if (time < beginTimeStamp) {
                    break;
                }

                // 符合时间范围，加入到结果中

                // 防止重复添加某个日期（翻页问题可能会导致重复添加）
                if (addedDates[record.date] == true) {
                    continue;
                }
                addedDates[record.date] = true;

                var result = {
                    date: moment.utc(record.date, 'YYYYMMDD').format('YYYY-MM-DD'),
                    hashrate: record.hash_rate + record.hash_rate_unit.replace('H/s', ''),
                    reject_rate: (record.share_reject / Math.max(record.share_accept + record.share_reject, 1) * 100).toFixed(2) + '%',
                    earn: record.earnings,
                    paid_amount: 0,
                    payment_tx: '',
                    address: '',
                    unpaid_reason: '',
                };

                for (var j in record.addrs) {
                    var r = record.addrs[j];
                    var prefix = (record.addrs.length == 1) ? '' : ' (第' + (j+1) + '笔)';
                    result.payment_tx += prefix + r.payment_tx;
                    result.address += prefix + r.address;
                    result.unpaid_reason += prefix + r.unpaid_reason;
                    result.paid_amount += parseFloat(r.payable);
                }

                fullList.push(result);
            }
        }

        return fullList;
    }

    static async makeHashrateEarnCSV(account, beginDate, endDate, skipHeader, showAccountName, updateProgress) {
        var list = await PoolAPI.getHashRateAndEarnList(account, beginDate, endDate, updateProgress);

        // 没有BOM会导致某些软件打开CSV乱码
        const unicodeBOM = "\uFEFF";
        const headerFieldAccountName = "子账户名";
        const headerFields = [
            "日期",
            "算力",
            "拒绝率",
            "收益(satoshi)",
            "收益(BTC)",
            "交易哈希",
            "收款地址",
            "备注"
        ];

        var csv = "";
        if (!skipHeader) {
            csv += unicodeBOM;
            if (showAccountName) {
                csv += headerFieldAccountName + ",";
            }
            csv += headerFields.join(',') + "\n";
        }

        for (var i in list) {
            var d = list[i];

            if (typeof (d.unpaid_reason) == 'string') {
                // 去除逗号和引号
                d.unpaid_reason = d.unpaid_reason.replace(/[,"]/g, ' ');
            }

            var fields = [
                d.date,
                d.hashrate,
                d.reject_rate,
                d.paid_amount,
                d.paid_amount / 100000000,
                d.payment_tx,
                d.address,
                d.unpaid_reason,
            ];

            if (showAccountName) {
                csv += account.name + ",";
            }
            csv += fields.join(',') + "\n";
        }

        return csv;
    }

    static async _getWorkers(account, page) {
        var params = {
            group: 0,
            page: page,
            page_size: 1000,
            status: 'all',
            puid: account.puid,
        };

        var result = await PoolAPI.get(account.endpoint, 'worker', params);

        if (typeof (result) != 'object') {
            throw "获取矿机列表失败，结果不是对象：" + JSON.stringify(result);
        }
        if (result.err_no != 0) {
            throw "获取矿机列表失败：" + JSON.stringify(result.err_msg);
        }

        return result.data;
    }

    static async _getWorkerHashrates(account, workerId, beginTimeStamp, count) {
        var params = {
            dimension: '1d',
            start_ts: beginTimeStamp,
            count: count,
            puid: account.puid,
        };

        var result = await PoolAPI.get(account.endpoint, 'worker/' + workerId + '/share-history', params);

        if (typeof (result) != 'object') {
            throw "获取矿机算力失败，结果不是对象：" + JSON.stringify(result);
        }
        if (result.err_no != 0) {
            throw "获取矿机算力失败：" + JSON.stringify(result.err_msg);
        }

        return result.data;
    }

    static async getWorkerHashRateList(account, beginTimeStamp, endTimeStamp, updateProgress) {
        beginTimeStamp /= 1000;
        endTimeStamp /= 1000;
        var days = (endTimeStamp - beginTimeStamp) / 3600 / 24 + 1;

        var mergedList = [/*
            ['worker1', '10.4T', '0.05%', '10.6T', '0.04%', ...],
            ['worker2', '13.1T', '0.03%', '13.8T', '0.02%', ...],
            ...
        */];

        updateProgress(0, '获取矿机列表...');
        var result = await PoolAPI._getWorkers(account, 1);
        var count = result.total_count;
        var pages = Math.ceil(count / 1000);
        var workers = result.data;

        updateProgress(10 / pages, '获取矿机列表 (1/' + pages + ')');

        for (let p = 2; p <= pages; p++) {
            var result = await PoolAPI._getWorkers(account, p);
            workers = workers.concat(result.data);
            updateProgress(10 / pages, '获取矿机列表 (' + p + '/' + pages + ')');
        }

        var promisePool = [];
        for (let i in workers) {
            let workerIndex = parseInt(i) + 1;
            let worker = workers[i];
            let request = PoolAPI._getWorkerHashrates(account, worker.worker_id, beginTimeStamp, days);
            request.worker_name = worker.worker_name;
            promisePool.push(request);

            if (promisePool.length >= 10 || workerIndex == workers.length) {
                updateProgress(90 * promisePool.length / count, '获取矿机算力 (' + workerIndex + '/' + count + ')');
                var results = await Promise.all(promisePool);

                for (let k in results) {
                    let hashrates = results[k];
                    let workerName = promisePool[k].worker_name;
                    let unit = hashrates.shares_unit;
                    let line = [workerName];

                    for (let j in hashrates.tickers) {
                        line.push(hashrates.tickers[j][1] + unit);
                        line.push((hashrates.tickers[j][2] * 100).toFixed(2) + '%');
                    }
                    mergedList.push(line);
                }

                promisePool = [];
            }
        }

        // 按矿机名进行排序
        mergedList.sort((a, b) => {
            // 11x22 -> 011x022
            let regular = s => (s || '').toLowerCase().split('x').map(x => x.padStart(3, '0')).join('x');
            return regular(a[0]) > regular(b[0]);
        });

        return mergedList;
    }

    static async makeWorkerHashrateCSV(account, beginDate, endDate, skipHeader, showAccountName, updateProgress) {
        var beginTimeStamp = moment.utc(beginDate).valueOf();
        var endTimeStamp = moment.utc(endDate).valueOf();

        if (endTimeStamp < beginTimeStamp) {
            var t = endTimeStamp;
            endTimeStamp = beginTimeStamp;
            beginTimeStamp = t;
        }

        var list = await PoolAPI.getWorkerHashRateList(account, beginTimeStamp, endTimeStamp, updateProgress);

        // 没有BOM会导致某些软件打开CSV乱码
        const unicodeBOM = "\uFEFF";
        const headerFieldAccountName = "子账户名";
        var headerFields = [
            "矿机名",
        ];
        for (let t = beginTimeStamp; t <= endTimeStamp; t += 3600 * 24 * 1000) {
            headerFields.push(moment.utc(t).format('YYYY-MM-DD'));
            headerFields.push('拒绝率');
        }

        var csv = "";
        if (!skipHeader) {
            csv += unicodeBOM;
            if (showAccountName) {
                csv += headerFieldAccountName + ",";
            }
            csv += headerFields.join(',') + "\n";
        }

        for (var i in list) {
            var fields = list[i];
            if (showAccountName) {
                csv += account.name + ",";
            }
            csv += fields.join(',') + "\n";
        }

        return csv;
    }
}

class MainWindow {
    static show(content) {
        ReactDOM.render(content, document.getElementById('MainWindow'));
    }

    static init() {
        if (DataStore.hasAccessKey()) {
            MainWindow.show(<SelectSubAccount />);
        } else {
            MainWindow.show(<InputAccessKey />);
        }
    }

    static saveAccessKey(ak) {
        DataStore.setAccessKey(ak);
        MainWindow.show(<SelectSubAccount />);
    }

    static switchUser() {
        MainWindow.show(<InputAccessKey />);
    }

    static exit() {
        DataStore.clearAccessKey();
        MainWindow.show(<ExitPage />);
    }
}
