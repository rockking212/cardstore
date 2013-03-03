<?php
/* *
 * 功能：支付宝纯担保交易接口接口调试入口页面
 * 版本：3.3
 * 日期：2012-07-23
 * 说明：
 * 以下代码只是为了方便商户测试而提供的样例代码，商户可以根据自己网站的需要，按照技术文档编写,并非一定要使用该代码。
 */

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
	<head>
	<title>支付宝纯担保交易接口接口</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
   	<link rel="stylesheet" type="text/css" media="all" href="bootstrap.min.css" />

</head>
<body text=#000000 bgColor=#ffffff leftMargin=0 topMargin=4>
<div id="main">
		<div id="head">
            <dl class="alipay_link">
                <a target="_blank" href="http://www.alipay.com/"><span>支付宝首页</span></a>|
                <a target="_blank" href="https://b.alipay.com/home.htm"><span>商家服务</span></a>|
                <a target="_blank" href="http://help.alipay.com/support/index_sh.htm"><span>帮助中心</span></a>
            </dl>
            <span class="title">支付宝纯担保交易接口快速通道</span>
		</div>
		<div class="row">
			<div class="span8 offset4">
        <form name=alipayment action=alipayapi.php method=post target="_blank">
            <div id="body" style="clear:left">
                <dl class="content">
                      <dt>商户订单号：</dt>
                    <dd>
                        <span class="null-star">*</span>
                        <input size="30" name="WIDout_trade_no" />
                        <span>商户网站订单系统中唯一订单号，必填
</span>
                    </dd>
                    <dt>订单名称：</dt>
                    <dd>
                        <span class="null-star">*</span>
                        <input size="30" name="WIDsubject" />
                        <span>必填
</span>
                    </dd>
                    <dt>付款金额：</dt>
                    <dd>
                        <span class="null-star">*</span>
                        <input size="30" name="WIDprice" />
                        <span>必填
</span>
                    </dd>
                    <dt>订单描述
：</dt>
                    <dd>
                        <span class="null-star">*</span>
                        <input size="30" name="WIDbody" />
                        <span></span>
                    </dd>
                    <dt>商品展示地址：</dt>
                    <dd>
                        <span class="null-star">*</span>
                        <input size="30" name="WIDshow_url" />
                        <span>需以http://开头的完整路径，如：http://www.xxx.com/myorder.html
</span>
                    </dd>
                    <dt>收货人姓名：</dt>
                    <dd>
                        <span class="null-star">*</span>
                        <input size="30" name="WIDreceive_name" />
                        <span>如：张三
</span>
                    </dd>
                    <dt>收货人地址：</dt>
                    <dd>
                        <span class="null-star">*</span>
                        <input size="30" name="WIDreceive_address" />
                        <span>如：XX省XXX市XXX区XXX路XXX小区XXX栋XXX单元XXX号
</span>
                    </dd>
                    <dt>收货人邮编：</dt>
                    <dd>
                        <span class="null-star">*</span>
                        <input size="30" name="WIDreceive_zip" />
                        <span>如：123456
</span>
                    </dd>
                    <dt>收货人电话号码：</dt>
                    <dd>
                        <span class="null-star">*</span>
                        <input size="30" name="WIDreceive_phone" />
                        <span>如：0571-88158090
</span>
                    </dd>
                    <dt>收货人手机号码：</dt>
                    <dd>
                        <span class="null-star">*</span>
                        <input size="30" name="WIDreceive_mobile" />
                        <span>如：13312341234</span>
                    </dd>
					<dt></dt>
                    <dd>
                        <span class="new-btn-login-sp">
						
                            <button class="btn btn-warning" type="submit" style="text-align:center;">确 认</button>
                        </span>
                    </dd>
                </dl>
            </div>
		</form>
		        </div>       
		 </div>
        <div id="foot">
			<ul class="foot-ul">
				<li><font class="note-help">如果您点击“确认”按钮，即表示您同意该次的执行操作。 </font></li>
				<li>
					支付宝版权所有 2011-2015 ALIPAY.COM 
				</li>
			</ul>
		</div>
	</div>
</body>
</html>