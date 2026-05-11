import Link from "next/link";
import { Scale } from "lucide-react";

export const metadata = {
  title: "Политика конфиденциальности — Агентум Про",
  description: "Политика конфиденциальности приложения Агентум Про",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Агентум Про</span>
            <span className="text-xs text-muted-foreground ml-2">
              система управления партнёрской сетью
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Политика конфиденциальности
        </h1>
        <div className="text-sm text-muted-foreground mb-8 pb-6 border-b border-border space-y-1">
          <p>
            <span className="font-medium text-foreground">Приложение:</span> Агентум Про
          </p>
          <p>
            <span className="font-medium text-foreground">Оператор:</span> ООО «Федеральная Экспертная Служба»
          </p>
          <p>
            <span className="font-medium text-foreground">Дата вступления в силу:</span> 12 мая 2026 года
          </p>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Настоящая Политика описывает, какие персональные данные мы собираем и обрабатываем
            при использовании мобильного и веб-приложения «Агентум Про» (далее — «Сервис»).
            Используя Сервис, вы подтверждаете согласие с условиями настоящей Политики.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 mt-8">
              1. Кто мы и как с нами связаться
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <span className="font-medium text-foreground">Юридическое лицо:</span> ООО «Федеральная Экспертная Служба»
              </li>
              <li>
                <span className="font-medium text-foreground">Адрес:</span> г. Самара
              </li>
              <li>
                <span className="font-medium text-foreground">Email для запросов по персональным данным:</span>{" "}
                <a href="mailto:privacy@agentum.club" className="text-primary hover:underline">
                  privacy@agentum.club
                </a>
              </li>
              <li>
                <span className="font-medium text-foreground">Сайт:</span>{" "}
                <a href="https://agentum.club" className="text-primary hover:underline">
                  agentum.club
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 mt-8">
              2. Какие данные мы собираем
            </h2>

            <h3 className="text-base font-semibold text-foreground mt-5 mb-2">
              2.1. Данные, которые вы предоставляете при регистрации и в профиле
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>ФИО</li>
              <li>Адрес электронной почты</li>
              <li>Номер телефона</li>
              <li>Пароль (хранится в виде криптографического хэша)</li>
              <li>Город проживания</li>
              <li>Специализация и профессия</li>
              <li>Дата рождения</li>
              <li>Пол</li>
              <li>Предпочтительный мессенджер (Telegram, MAX, ВКонтакте)</li>
              <li>Аватар (фотография), если вы её загрузили</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-5 mb-2">
              2.2. Данные, которые вы создаёте при работе с Сервисом
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Данные клиентов, которых вы передаёте в Компанию (ФИО, телефон, email, город,
                комментарии) — далее «лиды»
              </li>
              <li>Сообщения, отправленные через встроенный чат с менеджером</li>
              <li>История изменения статусов лидов и совершённых вами действий</li>
              <li>Запросы к ИИ-помощнику (контент чата)</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-5 mb-2">
              2.3. Данные, собираемые автоматически
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>IP-адрес и приблизительное географическое местоположение</li>
              <li>Тип устройства, модель, версия операционной системы</li>
              <li>
                Идентификатор push-устройства (Expo push token / FCM token) — только если вы дали
                разрешение на уведомления
              </li>
              <li>Логи действий в Сервисе (для отладки и обеспечения безопасности)</li>
              <li>Метаданные сессий: время входа, длительность</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-5 mb-2">
              2.4. Данные о подключённых внешних сервисах
            </h3>
            <p>Если вы добровольно подключаете внешние мессенджеры:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <span className="font-medium text-foreground">Telegram:</span> имя пользователя (username), Telegram ID
              </li>
              <li>
                <span className="font-medium text-foreground">MAX:</span> имя пользователя, идентификатор аккаунта
              </li>
            </ul>
            <p className="mt-2">
              Мы НЕ получаем доступ к вашим переписке или контактам в этих мессенджерах — только
              идентификаторы, необходимые для отправки уведомлений.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 mt-8">
              3. Зачем мы собираем данные (правовые основания)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="border border-border px-3 py-2 text-left font-semibold text-foreground">
                      Цель
                    </th>
                    <th className="border border-border px-3 py-2 text-left font-semibold text-foreground">
                      Правовое основание
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-3 py-2">
                      Создание и поддержание учётной записи
                    </td>
                    <td className="border border-border px-3 py-2">
                      Договор-оферта о партнёрстве
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border px-3 py-2">
                      Обработка переданных лидов и расчёт вознаграждения
                    </td>
                    <td className="border border-border px-3 py-2">Договор-оферта</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-3 py-2">
                      Отправка уведомлений в приложение/Telegram/MAX
                    </td>
                    <td className="border border-border px-3 py-2">Ваше согласие</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-3 py-2">
                      Связь с вами для технической и юридической поддержки
                    </td>
                    <td className="border border-border px-3 py-2">
                      Законный интерес Компании
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border px-3 py-2">
                      Аналитика и улучшение Сервиса
                    </td>
                    <td className="border border-border px-3 py-2">
                      Законный интерес Компании
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border px-3 py-2">
                      Защита от мошенничества и злоупотреблений
                    </td>
                    <td className="border border-border px-3 py-2">
                      Законный интерес Компании
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border px-3 py-2">
                      Выполнение требований законодательства РФ
                    </td>
                    <td className="border border-border px-3 py-2">Закон</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 mt-8">
              4. Кому мы передаём данные
            </h2>
            <p>
              Мы <span className="font-semibold text-foreground">не продаём</span> ваши персональные данные
              третьим лицам. Передача возможна только в следующих случаях:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <span className="font-medium text-foreground">Юристы и менеджеры Компании</span> — получают
                данные переданных вами лидов, чтобы вести с ними работу. Это основная функция Сервиса.
              </li>
              <li>
                <span className="font-medium text-foreground">Поставщики инфраструктуры</span> — серверы
                хостинга (Российская Федерация), сервисы push-уведомлений (Expo, Apple Push Notifications
                Service, Firebase Cloud Messaging). Они обрабатывают данные исключительно по нашему
                поручению.
              </li>
              <li>
                <span className="font-medium text-foreground">ИИ-провайдер</span> — при использовании
                встроенного чата с ИИ ваши сообщения передаются языковой модели для генерации ответа. Мы
                не передаём в этот канал ваши персональные данные напрямую — только содержимое вашего
                вопроса.
              </li>
              <li>
                <span className="font-medium text-foreground">Государственные органы</span> — только по
                официальному запросу в рамках закона.
              </li>
            </ul>
            <p className="mt-3">
              Передача данных за пределы Российской Федерации может осуществляться только при
              использовании сервисов Apple/Google (push-уведомления) — в минимальном объёме,
              необходимом для доставки уведомления.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 mt-8">
              5. Сколько времени мы храним данные
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <span className="font-medium text-foreground">Профиль и учётная запись</span> — до момента
                удаления вами или закрытия партнёрства. После закрытия — 3 года для целей бухгалтерского
                учёта и налогового аудита.
              </li>
              <li>
                <span className="font-medium text-foreground">Лиды</span> — бессрочно, как часть истории
                работы Компании с клиентами.
              </li>
              <li>
                <span className="font-medium text-foreground">Сообщения чата</span> — 2 года.
              </li>
              <li>
                <span className="font-medium text-foreground">Логи действий</span> — 1 год.
              </li>
              <li>
                <span className="font-medium text-foreground">Push-токены</span> — до отзыва разрешения
                или удаления приложения.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 mt-8">6. Ваши права</h2>
            <p>
              В соответствии с Федеральным законом № 152-ФЗ «О персональных данных» и применимыми
              международными нормами вы имеете право:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>получить копию хранящихся у нас о вас данных;</li>
              <li>
                исправить неточные или неполные данные (через раздел «Профиль» в приложении или письмом
                на privacy@agentum.club);
              </li>
              <li>
                удалить свою учётную запись и связанные с ней персональные данные (запрос на
                privacy@agentum.club);
              </li>
              <li>отозвать согласие на обработку данных в любой момент;</li>
              <li>ограничить обработку данных;</li>
              <li>получить данные в машиночитаемом формате (право на переносимость);</li>
              <li>подать жалобу в Роскомнадзор, если считаете, что ваши права нарушены.</li>
            </ul>
            <p className="mt-3">Срок ответа на запрос — не более 30 календарных дней.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 mt-8">7. Безопасность</h2>
            <p>Мы применяем следующие меры защиты:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>HTTPS-шифрование всего трафика</li>
              <li>JWT-токены для аутентификации</li>
              <li>Хэширование паролей</li>
              <li>Регулярные обновления серверного ПО</li>
              <li>Ограничение доступа к базе данных по белому списку</li>
              <li>Резервное копирование с шифрованием</li>
            </ul>
            <p className="mt-3">
              Несмотря на все меры, ни один способ передачи и хранения данных в интернете не
              гарантирует 100% защиты. Если вы заметили признаки компрометации вашей учётной записи,
              незамедлительно сообщите на privacy@agentum.club.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 mt-8">8. Дети</h2>
            <p>
              Сервис <span className="font-semibold text-foreground">не предназначен для лиц младше 18 лет</span>.
              Мы сознательно не собираем данные несовершеннолетних. Если вам стало известно о таком
              случае — сообщите нам, и мы удалим данные.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 mt-8">
              9. Файлы cookie (web-версия)
            </h2>
            <p>
              Веб-версия{" "}
              <a href="https://app.agentum.club" className="text-primary hover:underline">
                app.agentum.club
              </a>{" "}
              использует технические cookie:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>сессионный токен аутентификации;</li>
              <li>настройки темы и языка интерфейса.</li>
            </ul>
            <p className="mt-3">Маркетинговые и трекинговые cookie не используются.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 mt-8">
              10. Пуш-уведомления
            </h2>
            <p>
              При первом запуске мобильного приложения мы запрашиваем разрешение на отправку
              push-уведомлений. Вы можете отозвать его в системных настройках устройства в любой
              момент — функциональность приложения при этом сохранится, но уведомления перестанут
              приходить.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 mt-8">
              11. Изменения политики
            </h2>
            <p>
              Мы можем обновлять настоящую Политику. Существенные изменения публикуются в приложении
              и на сайте за 14 дней до вступления в силу. Дата последней редакции указана в начале
              документа.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 mt-8">12. Контакты</h2>
            <p>По любым вопросам о персональных данных:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>
                <span className="font-medium text-foreground">Email:</span>{" "}
                <a href="mailto:privacy@agentum.club" className="text-primary hover:underline">
                  privacy@agentum.club
                </a>
              </li>
              <li>
                <span className="font-medium text-foreground">Письменно:</span> ООО «Федеральная Экспертная Служба», г. Самара
              </li>
              <li>
                <span className="font-medium text-foreground">Через приложение:</span> раздел «Поддержка»
              </li>
            </ul>
          </section>

          <p className="text-xs italic mt-12 pt-6 border-t border-border">
            Версия 1.0 от 12 мая 2026 года.
          </p>
        </div>
      </main>
    </div>
  );
}
