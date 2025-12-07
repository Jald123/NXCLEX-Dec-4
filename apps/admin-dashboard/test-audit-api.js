const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testDirectKey() {
    console.log('Testing API Key directly...');
    const API_KEY = 'AIzaSyAhPrwVud7qtIfwGJUPhsL6Fl_KizV3dJs'; // User provided key
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    try {
        const result = await model.generateContent('Hello, are you working?');
        const response = await result.response;
        const text = response.text();
        console.log('Success! AI responded:', text);
    } catch (error) {
        console.error('Direct SDK Test Failed:', error);
    }
}

testDirectKey();
