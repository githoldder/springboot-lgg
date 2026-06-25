package com.ruoyi.notice.websocket;

import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@ServerEndpoint("/websocket/{userId}")
public class WebSocketServer {

    private static final Logger log = LoggerFactory.getLogger(WebSocketServer.class);

    private static final Map<String, Session> sessionMap = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("userId") String userId) {
        log.info("WebSocket connection opened for user: {}", userId);
        sessionMap.put(userId, session);
    }

    @OnClose
    public void onClose(@PathParam("userId") String userId) {
        log.info("WebSocket connection closed for user: {}", userId);
        sessionMap.remove(userId);
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        log.info("Received message from client: {}", message);
    }

    @OnError
    public void onError(Session session, Throwable error) {
        log.error("WebSocket error: {}", error.getMessage());
    }

    public static void sendMessageToUser(String userId, String message) {
        Session session = sessionMap.get(userId);
        if (session != null && session.isOpen()) {
            try {
                session.getBasicRemote().sendText(message);
                log.info("Sent message to user {}: {}", userId, message);
            } catch (Exception e) {
                log.error("Failed to send message to user {}: {}", userId, e.getMessage());
            }
        }
    }

    public static void sendToAllClients(String message) {
        Collection<Session> sessions = sessionMap.values();
        for (Session session : sessions) {
            if (session.isOpen()) {
                try {
                    session.getBasicRemote().sendText(message);
                    log.info("Broadcasted message to session {}: {}", session.getId(), message);
                } catch (Exception e) {
                    log.error("Failed to broadcast message to session {}: {}", session.getId(), e.getMessage());
                }
            }
        }
    }
}
