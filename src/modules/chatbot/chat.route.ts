import { Router } from 'express';
import { chat, clearSession, getIntroduction, healthCheck } from './chat.controller';


const router = Router();

router.get('/health', healthCheck);


router.get('/introduction', getIntroduction);


router.post('/chat', chat);

router.post('/clear-session', clearSession);

export const chatbotRoute = router