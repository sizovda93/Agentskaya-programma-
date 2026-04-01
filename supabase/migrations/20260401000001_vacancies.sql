-- Vacancies + applications
CREATE TABLE vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  conditions TEXT,
  salary_from INT,
  salary_to INT,
  is_remote BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vacancy_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vacancy_apps_vacancy ON vacancy_applications(vacancy_id);
CREATE INDEX idx_vacancy_apps_status ON vacancy_applications(status);

-- Seed: first vacancy
INSERT INTO vacancies (title, description, requirements, conditions, salary_from, salary_to, is_remote) VALUES (
  'Менеджер по продвижению',
  'Ищем менеджера по продвижению партнёрской программы по банкротству физических лиц.

Вы будете отвечать за привлечение новых партнёров в сеть, развитие существующих партнёрских отношений и увеличение потока клиентов через партнёрские каналы.

Основные задачи:
- Поиск и привлечение новых партнёров (агентов) в программу
- Обучение и сопровождение партнёров на начальном этапе
- Разработка и реализация стратегий продвижения партнёрской программы
- Работа с CRM-системой, ведение отчётности
- Анализ эффективности партнёрских каналов
- Взаимодействие с юридическим отделом по вопросам клиентов',

  'Опыт работы в продажах или партнёрских программах от 2 лет
Навыки ведения переговоров и презентаций
Умение работать с CRM-системами
Грамотная устная и письменная речь
Ответственность и нацеленность на результат
Желательно: опыт в юридической или финансовой сфере',

  'Удалённая работа из любого города России
Гибкий график — главное результат
Оформление по ТК РФ или договору ГПХ
Бонусы за выполнение KPI
Обучение за счёт компании
Дружная команда профессионалов
Возможность карьерного роста до руководителя направления',

  50000,
  120000,
  true
);
