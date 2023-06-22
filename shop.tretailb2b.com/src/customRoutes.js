import React from 'react';
import { Route } from 'react-router-dom';
import Profile from './settings/profile';
import Registration from './registration';
import VerifyShop from './verify-shop';
import VerifyUser from './verify-user';
import ThankYouVerifyShop from './thank-you-shop-verification';
import ThankYouUserVerification from './thank-you-user-verification';
// import Settings from './store/settings/settings';
import AddVariant from './store/products/addVariant';
import Template from './store/logs/templates';
import resetPassword from './resetPassword';
import UpdatePassword from './UpdatePassword';
import PickList from './picklist/index';
import PickListItems from './picklist/components/PickListItems';
// import ChannelsDashBoard from './store/channels/dashboard'
import Channel from './store/channels/index';
import reports from './store/reports/reports';
import logtab from './logtab';
import ProfileOption  from './settings/profileOption';
import Transactions from './store/orders/transactions';
import InventrySync from './settings/inventrysync';
import Store from './store';
import ProfileUpdate from './settings/profile-update';
import { CustomerTab } from './store/orders/customers';
import AdminSetting from './admin/settings/settings';
import Analytics from './store/products/analytics';
import Progress from './coming_soon';
import Notifications from './notifications/notifications';
import { WMSInboundSection } from './wms/components/inbound';

export default [
    <Route exact path="/profile" component={Profile} />,
    <Route exact path="/templates" component={Template} />,
    // <Route exact path="/settings" component={ChannelsDashBoard} />,
    <Route exact path="/settings" component={Channel} />,
    // <Route exact path="/settings-old" component={Settings} />,
    <Route exact path="/add-variants" component={AddVariant} />,
    <Route exact path="/signup" component={Registration} noLayout/>,
    <Route exact path="/verify-shop" component={VerifyShop} noLayout/>,
    <Route exact path="/verify-user" component={VerifyUser} noLayout/>,
    <Route exact path="/thank-you-shop-verification" component={ThankYouVerifyShop} noLayout/>,
    <Route exact path="/thank-you-user-verification" component={ThankYouUserVerification} noLayout/>,
    <Route exact path="/password-reset" component={resetPassword} noLayout/>,
    <Route exact path="/password-update/:token" component={UpdatePassword} noLayout/>,
    <Route exact path="/picklist" component={PickList}/>,
    <Route exact path="/picklist/:id/items" component={PickListItems}/>,
    <Route exact path="/reports" component={reports}/>,
    <Route exact path="/logtab/:tab?" component={logtab}/>,
    <Route exact path="/profileOption" component={ProfileOption}/>,
    <Route exact path="/transactions" component={Transactions}/>,
    <Route exact path="/inventrysync" component={InventrySync}/>,
    <Route exact path="/store" component={Store}/>,
    <Route exact path="/profile-update" component={ProfileUpdate}/>,
    <Route exact path="/customers" component={CustomerTab} />,
    <Route exact path="/admin/settings" component={AdminSetting} />,
    <Route exact path="/analytics" component={Analytics} />,
    <Route exact path="/coming-soon" component={Progress} />,
    <Route exact path="/notifications" component={Notifications} />,
    <Route exact path="/wms-inbound/:tab" component={WMSInboundSection} />,
];