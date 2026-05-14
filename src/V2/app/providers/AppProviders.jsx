import { App as AntdApp, ConfigProvider } from "antd";
import { Provider as ReduxProvider } from "react-redux";

import { store } from "../../redux/store";
import { antdTheme } from "../../theme/antdTheme";

function AppProviders({ children }) {
  return (
    <ReduxProvider store={store}>
      <ConfigProvider theme={antdTheme}>
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ReduxProvider>
  );
}

export default AppProviders;
