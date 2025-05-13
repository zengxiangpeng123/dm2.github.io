// 导入 Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase 配置信息
const firebaseConfig = {
    apiKey: "AIzaSyAXF20A8X9zXqPdzdNnS1Pz5biTYwRPNgw",
    authDomain: "wankanmmz.firebaseapp.com",
    projectId: "wankanmmz",
    storageBucket: "wankanmmz.firebasestorage.app",
    messagingSenderId: "825823425603",
    appId: "1:825823425603:web:551fe572acf4ee09ae50f6",
    measurementId: "G-09W2CV7WTQ"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 获取 auth 实例
const auth = getAuth(app);

// 导出 auth 实例供其他文件使用
export { auth }; 