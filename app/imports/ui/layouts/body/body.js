import "./body.html";
import "../../components/layouts/nav/nav";
import "../../components/layouts/footer/footer";
import { Template } from "meteor/templating";
Template.BodyTemplate.onRendered(() => {
  $(".accounts-dialog.accounts-centered-dialog").html(
    '\n      <p >Email đã được xác thực.</p>\n      Bạn đã đăng nhập thành công !\n      <div class="login-button" id="just-verified-dismiss-button">Đồng ý</div>\n    '
  );
});
