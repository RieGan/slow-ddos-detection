# Low and Slow DDoS Detection and Mitigation using Machine Learning for HTTP services
## Introduction
This project is continuation of Research Project with title "DEEP LEARNING-BASED DETECTION SYSTEM FOR SLOW AND LOW DDOS ATTACKS AT THE APPLICATION LAYER". The main goal of this project is to detect and mitigate Low and Slow DDoS attacks using Machine Learning inside application layer.

## Usage
### Installation
```bash
npm install slow-ddos-detection
```

### Database Initialization
```bash
npm run slow-ddos-detection db-init
```

### Using as Middleware
```javascript
import { middleware } from 'slow-ddos-detection';

const server = http.createServer((req, res) => {
    middleware(req, res, (req, res) => {
        // Your code here
    }, {
        // Options
        identifierGetter: (req) => req.ip,
    });
});

server.listen(process.env.PORT || 8080, () => {
  console.log(`Server listening on port ${process.env.PORT || 8080}`)
})
```

### Using the detection function
```javascript
import { detectFromLogInterval } from 'slow-ddos-detection';

detectFromLogInterval({
    model: 'lstm-8',
    interval: 1000,
    clientSize: 10
})
```

## Available Models
| Model | Accuracy | Precision | Recall | F1 Score | Time per Prediction (ms) |
| --- | --- | --- | --- | --- | --- |
| cnn1d-4 | 0.97561738 | 0.97123202 | 0.979810726 | 0.975502513 | 0.725539231 |
| lstm-4 | 0.979055955 | 0.975609756 | 0.982367758 | 0.978977094 | 2.142544545 |
| lstm2-4 | 0.989371679 | 0.991244528 | 0.987538941 | 0.989388265 | 4.525164114 |
| cnn1d-8 | 0.98249453 | 0.983114447 | 0.981886321 | 0.9825 | 0.898093154 |
| lstm-8 | 0.99187246 | 0.9931207 | 0.990642545 | 0.991880075 | 4.911534855 |
| lstm2-8 | 0.99187246 | 0.995622264 | 0.988206083 | 0.991900312 | 8.551422319 |
| cnn1d-16 | 0.989684276 | 0.991244528 | 0.988154613 | 0.989697159 | 0.985933104 |
| lstm-16 | 0.994373242 | 0.998123827 | 0.990689013 | 0.994392523 | 8.0675211 |
| lstm2-16 | 0.995623632 | 0.999374609 | 0.991930478 | 0.995638629 | 16.44170053 |
| cnn1d-32 | 0.993122851 | 0.996247655 | 0.990055935 | 0.993142145 | 1.036886527 |
| lstm-32 | 0.993748046 | 0.999374609 | 0.988249845 | 0.993781095 | 34.05501719 |
| lstm2-32 | 0.99593623 | 0.999374609 | 0.992546584 | 0.995948894 | 60.39418568 |

## Impact
This project is expected to help developers to detect and mitigate Low and Slow DDoS attacks using Machine Learning inside application layer.

### CPU Usage
![CPU Usage](https://imgur.com/8plOu3d.png)

### Memory Usage
![Memory Usage](https://imgur.com/GEsUM3s.png)

### Alive Connections
![Alive Connections](https://imgur.com/kWWLAIO.png)


